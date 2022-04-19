import { composeAPI, Transaction } from "@iota/core";
import { Blake2b } from "@iota/crypto.js-stardust";
import { addressBalance, ED25519_ADDRESS_TYPE, IMilestoneResponse, IOutputResponse, IOutputsResponse, serializeMessage, SingleNodeClient, IndexerPluginClient } from "@iota/iota.js-stardust";
import { Converter, HexHelper, WriteStream } from "@iota/util.js-stardust";
import bigInt from "big-integer";
import { ChronicleClient } from "../../clients/chronicleClient";
import { HornetClient } from "../../clients/hornetClient";
import { ITransactionsDetailsRequest } from "../../models/api/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "../../models/api/ITransactionsDetailsResponse";
import { ITransactionsCursor } from "../../models/api/og/ITransactionsCursor";
import { TransactionsGetMode } from "../../models/api/og/transactionsGetMode";
import { IMessageDetailsResponse } from "../../models/api/stardust/IMessageDetailsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../fetchHelper";
import { SearchQueryBuilder, SearchQuery } from "./searchQueryBuilder";

/**
 * Helper functions for use with tangle.
 */
export class StardustTangleHelper {
    /**
     * Find hashes of the given type.
     * @param network The network to use.
     * @param hashTypeName The type of the hash.
     * @param hash The hash.
     * @param limit Limit the number of hashes to return.
     * @returns The list of transactions hashes.
     */
    public static async findHashes(
        network: INetwork,
        hashTypeName: TransactionsGetMode,
        hash: string,
        limit?: number): Promise<{
            /**
             * The hashes we found in the lookup
             */
            hashes: string[];
            /**
             * Cursor for getting more items.
             */
            cursor?: ITransactionsCursor;
        }> {
        const findReq = {};
        findReq[hashTypeName] = [hash];

        let hashes: string[] = [];

        const cursor: ITransactionsCursor = {
        };

        try {
            const hornetClient = new HornetClient(network.provider, network.user, network.password);

            const response = await hornetClient.findTransactions({
                ...findReq,
                maxresults: 5000
            });

            if (response?.hashes && response.hashes.length > 0) {
                hashes = response.hashes;
                cursor.node = hashes.length;

                if (limit !== undefined) {
                    cursor.hasMore = hashes.length > limit;
                    if (hashes.length > limit) {
                        // If there is a limit then remove any additional
                        hashes = hashes.slice(0, limit);
                    }
                } else {
                    cursor.hasMore = hashes.length === 5000;
                }
            }
        } catch (err) {
            console.error("API Error", err);
        }

        // Also request more from chronicle if permanode is configured
        if (network.permaNodeEndpoint) {
            const chronicleClient = new ChronicleClient(network.permaNodeEndpoint);

            const response = await chronicleClient.findTransactions(findReq);

            if (response?.hashes && response.hashes.length > 0) {
                cursor.perma = response.hashes.length;

                if (response.hints && response.hints.length > 0) {
                    cursor.permaPaging = Buffer.from(JSON.stringify(response.hints[0])).toString("base64");
                }

                // Add any that we didn't already get from hornet
                hashes = hashes.concat(response.hashes.filter(h => !hashes.includes(h)));

                if (limit !== undefined) {
                    cursor.hasMore = hashes.length > limit;
                    if (hashes.length > limit) {
                        // If there is a limit then remove any additional
                        hashes = hashes.slice(0, limit);
                    }
                } else {
                    cursor.hasMore = hashes.length === 5000;
                }
            }
       }

        cursor.nextIndex = hashes.length;

        return {
            hashes,
            cursor
        };
    }

    /**
     * Get transactions for the requested hashes.
     * @param network The network configuration.
     * @param hashes The hashes to get the transactions.
     * @returns The response.
     */
    public static async getTrytes(
        network: INetwork,
        hashes: string[]): Promise<{
            /**
             * The trytes for the requested transactions.
             */
            trytes?: string[];

            /**
             * The confirmation state of the transactions.
             */
            milestoneIndexes?: number[];
        }
        > {
        const allTrytes: {
            /**
             * The original index.
             */
            index: number;
            /**
             * The hash.
             */
            hash: string;
            /**
             * The trytes.
             */
            trytes?: string;
            /**
             * The milestone index.
             */
            milestoneIndex: number | null;
        }[] = hashes.map((h, idx) => ({ index: idx, hash: h, milestoneIndex: null }));


        // If we have a permanode connection try there first
        if (network.permaNodeEndpoint) {
            const chronicleClient = new ChronicleClient(network.permaNodeEndpoint);

            const response = await chronicleClient.getTrytes({ hashes });

            if (response?.trytes) {
                for (let i = 0; i < hashes.length; i++) {
                    allTrytes[i].trytes = response.trytes[i];

                    allTrytes[i].milestoneIndex = response.milestones[i];
                }
            }
        }

        try {
            const missingTrytes = allTrytes.filter(a => !a.trytes);

            if (missingTrytes.length > 0) {
                const api = composeAPI({
                    provider: network.provider,
                    user: network.user,
                    password: network.password
                });

                const response = await api.getTrytes(missingTrytes.map(a => a.hash));
                if (response) {
                    for (let i = 0; i < response.length; i++) {
                        missingTrytes[i].trytes = response[i];
                    }
                }
            }
        } catch (err) {
            console.error(`${network.network}`, err);
        }

        try {
            const missingState = allTrytes.filter(a => a.milestoneIndex === null);

            if (missingState.length > 0) {
                const api = composeAPI({
                    provider: network.provider,
                    user: network.user,
                    password: network.password
                });

                const statesResponse = await api.getInclusionStates(missingState.map(a => a.hash));
                if (statesResponse) {
                    for (let i = 0; i < statesResponse.length; i++) {
                        missingState[i].milestoneIndex = statesResponse[i] ? 1 : 0;
                    }
                }
            }
        } catch (err) {
            console.error(`${network.network}`, err);
        }

        return {
            trytes: allTrytes.map(t => t.trytes || "9".repeat(2673)),
            milestoneIndexes: allTrytes.map(t => t.milestoneIndex ?? 0)
        };
    }

    /**
     * Can we promote the tranaction.
     * @param network The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction is promotable.
     */
    public static async canPromoteTransaction(
        network: INetwork,
        tailHash: string): Promise<boolean> {
        try {
            const api = composeAPI({
                provider: network.provider,
                user: network.user,
                password: network.password
            });

            const result = await api.isPromotable(
                tailHash
            );
            return result as boolean;
        } catch {
            return false;
        }
    }

    /**
     * Promote the tranaction.
     * @param network The network to use.
     * @param tailHash The hash.
     * @returns Hash if the transaction was promoted.
     */
    public static async promoteTransaction(
        network: INetwork,
        tailHash: string): Promise<string | undefined> {
        try {
            const api = composeAPI({
                provider: network.provider,
                user: network.user,
                password: network.password
            });

            const response = await api.promoteTransaction(
                tailHash,
                network.depth,
                network.mwm
            );

            if (Array.isArray(response) && response.length > 0) {
                const txs = response[0] as Transaction[];
                return txs.length > 0 ? txs[0].hash : undefined;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Replay the tranaction.
     * @param network The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction was promoted.
     */
    public static async replayBundle(
        network: INetwork,
        tailHash: string): Promise<string | undefined> {
        try {
            const api = composeAPI({
                provider: network.provider,
                user: network.user,
                password: network.password
            });

            const response = await api.replayBundle(
                tailHash,
                network.depth,
                network.mwm
            );
            if (Array.isArray(response) && response.length > 0) {
                return response[0].hash as string;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Get the balance for an address.
     * @param network Which network are we getting the address details for.
     * @param addressHash The addresss hash to get the balance.
     * @returns The balance for the address.
     */
    public static async getAddressBalance(
        network: INetwork,
        addressHash: string): Promise<number> {
        try {
            const api = composeAPI({
                provider: network.provider,
                user: network.user,
                password: network.password
            });

            const response = await api.getBalances([addressHash]);
            if (response?.balances && response?.balances.length > 0) {
                return response?.balances[0] as number;
            }
        } catch (err) {
            console.error(err);
        }

        return 0;
    }

    /**
     * Find item on the chrysalis network.
     * @param network The network to find the items on.
     * @param query The query to use for finding items.
     * @param cursor A cursor if are requesting subsequent pages.
     * @returns The item found.
     */
    public static async search(network: INetwork, query: string, cursor?: string): Promise<ISearchResponse> {
        // If we have a cursor this must be next page of permanode, so don't do the node lookup
        let nodeResult = cursor ? {} : await StardustTangleHelper.searchApi(
            network.provider, network.user, network.password, false, network.bechHrp, query);

        // If there were no results from regular node and we have a permanode
        // or if there were output ids get any additional historic ones
        if (network.permaNodeEndpoint &&
            (Object.keys(nodeResult).length === 0 || nodeResult.addressOutputIds || nodeResult.indexMessageIds)) {
            const permaResult = await StardustTangleHelper.searchApi(
                network.permaNodeEndpoint,
                network.permaNodeEndpointUser,
                network.permaNodeEndpointPassword,
                true,
                network.bechHrp,
                query);

            if (nodeResult.addressOutputIds) {
                if (permaResult.addressOutputIds) {
                    nodeResult.historicAddressOutputIds =
                        permaResult.addressOutputIds.filter(a => !nodeResult.addressOutputIds.includes(a));
                    nodeResult.cursor = permaResult.cursor;
                }
            } else if (nodeResult.indexMessageIds) {
                if (permaResult.indexMessageIds) {
                    nodeResult.indexMessageIds = nodeResult.indexMessageIds.concat(
                        permaResult.indexMessageIds.filter(a => !nodeResult.indexMessageIds.includes(a)));
                    nodeResult.cursor = permaResult.cursor;
                }
            } else {
                nodeResult = permaResult;
            }
        }

        return nodeResult;
    }

    /**
     * Get the message details.
     * @param network The network to find the items on.
     * @param messageId The message id to get the details.
     * @returns The item details.
     */
    public static async messageDetails(network: INetwork, messageId: string): Promise<IMessageDetailsResponse> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });

            messageId = HexHelper.addPrefix(messageId);
            const metadata = await client.messageMetadata(messageId);
            const children = await client.messageChildren(messageId);

            return {
                metadata,
                childrenMessageIds: children ? children.childrenMessageIds : undefined
            };
        } catch {
        }

        if (network.permaNodeEndpoint) {
            try {
                const client = new SingleNodeClient(network.permaNodeEndpoint, {
                    userName: network.permaNodeEndpointUser,
                    password: network.permaNodeEndpointPassword,
                    basePath: "/"
                });

                const metadata = await client.messageMetadata(messageId);
                const children = await client.messageChildren(messageId);

                return {
                    metadata,
                    childrenMessageIds: children ? children.childrenMessageIds : undefined
                };
            } catch {
            }
        }
    }

    /**
     * Get the output details.
     * @param network The network to find the items on.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public static async outputDetails(network: INetwork, outputId: string): Promise<IOutputResponse | undefined> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });
            return await client.output(outputId);
        } catch {
        }

        if (network.permaNodeEndpoint) {
            try {
                const client = new SingleNodeClient(network.permaNodeEndpoint, {
                    userName: network.permaNodeEndpointUser,
                    password: network.permaNodeEndpointPassword,
                    basePath: "/"
                });
                return await client.output(outputId);
            } catch {
            }
        }
    }

    /**
     * Get the transactions of an address.
     * @param network The network to find the items on.
     * @param request The request.
     * @returns The transactions.
     */
    public static async transactionsDetails(network: INetwork,
        request: ITransactionsDetailsRequest): Promise<ITransactionsDetailsResponse | undefined> {
        if (network.permaNodeEndpoint) {
            const endpoint = network.permaNodeEndpoint;
            try {
                const address = request.address;
                const params = {
                    // eslint-disable-next-line camelcase
                    page_size: request.page_size,
                    state: request.state
                };

                const res = await FetchHelper.json<never, ITransactionsDetailsResponse>(
                    endpoint,
                    `transactions/ed25519/${address}${params ? `${FetchHelper.urlParams(params)}` : ""}`,
                    "get"
                );
                    return res;
            } catch (e) {
                return { error: e };
            }
        }
    }

    /**
     * Get the milestone details.
     * @param network The network to find the items on.
     * @param milestoneIndex The milestone iindex to get the details.
     * @returns The item details.
     */
    public static async milestoneDetails(
        network: INetwork, milestoneIndex: number): Promise<IMilestoneResponse | undefined> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });
            return await client.milestone(milestoneIndex);
        } catch {
        }

        if (network.permaNodeEndpoint) {
            try {
                const client = new SingleNodeClient(network.permaNodeEndpoint, {
                    userName: network.permaNodeEndpointUser,
                    password: network.permaNodeEndpointPassword,
                    basePath: "/"
                });
                return await client.milestone(milestoneIndex);
            } catch {
            }
        }
    }

    /**
     * Find item on the stardust network.
     * @param provider The provider for the REST API.
     * @param user The user for the for the REST API.
     * @param password The password for the REST API.
     * @param isPermanode Is this a permanode endpoint.
     * @param bechHrp The bech32 hrp for the network.
     * @param query The query to use for finding items.
     * @param cursor Cursor data to send with the request.
     * @returns The item found.
     */
    private static async searchApi(
        provider: string,
        user: string | undefined,
        password: string | undefined,
        isPermanode: boolean,
        bechHrp: string,
        query: string,
        cursor?: string): Promise<ISearchResponse> {
        const client = new SingleNodeClient(provider, {
            userName: user,
            password,
            basePath: isPermanode ? "/" : undefined
        });
        const indexerPlugin = new IndexerPluginClient(client);
        const searchQuery: SearchQuery = new SearchQueryBuilder(query, bechHrp).build();

        if (searchQuery.did) {
            return {
                did: searchQuery.did
            };
        }

        if (searchQuery.milestone) {
            try {
                return {
                    milestone: await client.milestone(searchQuery.milestone)
                };
            } catch {
            }
        }

        if (searchQuery.address?.bech32) {
            try {
                if (isPermanode && searchQuery.address.addressType === ED25519_ADDRESS_TYPE) {
                    // Permanode doesn't support the bech32 address endpoint so convert
                    // the query to ed25519 format if thats what the type is
                    // it will then be tried using the ed25519 address/outputs endpoint
                    // later in this process
                    const addressDetails = {
                        addressType: ED25519_ADDRESS_TYPE,
                        address: searchQuery.address.hex,
                        balance: bigInt(0),
                        dustAllowed: false,
                        ledgerIndex: 0,
                        nativeTokens: {}
                    };

                    const addressOutputs = await indexerPlugin.outputs({ addressBech32: searchQuery.address.bech32 });

                    if (addressOutputs.items.length > 0) {
                        const state = (addressOutputs as (IOutputsResponse & {
                            state?: unknown;
                        })).state;

                        return {
                            address: searchQuery.address.bech32,
                            addressDetails,
                            addressOutputIds: addressOutputs.items,
                            cursor: state ? Converter.utf8ToHex(JSON.stringify(state)) : undefined
                        };
                    }
                } else {
                    const addressDetails = await addressBalance(client, searchQuery.address.bech32);
                    // TO DO: confirm address.ledgerIndex > 0 condition is valid way to decide if address exists?
                    // Address object will always be retrieved even for bech32 addresses that dont exist.
                    if (addressDetails && addressDetails.ledgerIndex > 0) {
                        const addressOutputs = await indexerPlugin.outputs(
                            { addressBech32: searchQuery.address.bech32 }
                        );

                        return {
                            address: searchQuery.address.bech32,
                            addressDetails,
                            addressOutputIds: addressOutputs.items
                        };
                    }
                }
            } catch {}
        }

        if (searchQuery.messageIdOrTransactionId) {
            try {
                const message = await client.message(searchQuery.messageIdOrTransactionId);

                if (Object.keys(message).length > 0) {
                    return {
                        message
                    };
                }
            } catch {
            }

            try {
                const message = await client.transactionIncludedMessage(searchQuery.address.hex);

                if (Object.keys(message).length > 0) {
                    const writeStream = new WriteStream();
                    serializeMessage(writeStream, message);
                    const includedMessageId = Converter.bytesToHex(Blake2b.sum256(writeStream.finalBytes()));

                    return {
                        message,
                        includedMessageId
                    };
                }
            } catch {
            }
        }

        if (searchQuery.output) {
            try {
                return {
                    output: await client.output(searchQuery.output)
                };
            } catch {
            }
        }

        // Stardust specific searches
        if (searchQuery.aliasId) {
            try {
                const aliasOutputs = await indexerPlugin.alias(searchQuery.aliasId);
                if (aliasOutputs.items.length > 0) {
                    // TODO Only taking last item, check how to do it properly
                    const aliasOutput = await client.output(aliasOutputs.items[aliasOutputs.items.length - 1]);

                    return {
                        output: aliasOutput
                    };
                }
            } catch {}
        }

        if (searchQuery.nftId) {
            try {
                const nftOutputs = await indexerPlugin.nft(searchQuery.nftId);
                if (nftOutputs.items.length > 0) {
                    // TODO Only taking last item, check how to do it properly
                    const nftOutput = await client.output(nftOutputs.items[nftOutputs.items.length - 1]);

                    return {
                        output: nftOutput
                    };
                }
            } catch {}
        }

        if (searchQuery.foundryId) {
            try {
                const foundryOutputs = await indexerPlugin.foundry(searchQuery.foundryId);

                if (foundryOutputs.items.length > 0) {
                    const foundryOutput = await client.output(foundryOutputs.items[0]);

                    return {
                        output: foundryOutput
                    }
                }

            } catch {}
        }

        return {};
    }
}

