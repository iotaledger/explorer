import { composeAPI, Transaction } from "@iota/core";
import { Bech32Helper, Converter, ED25519_ADDRESS_TYPE, IAddressOutputsResponse, IMessagesResponse, IMilestoneResponse, IOutputResponse, SingleNodeClient } from "@iota/iota.js";
import { ChronicleClient } from "../clients/chronicleClient";
import { HornetClient } from "../clients/hornetClient";
import { IMessageDetailsResponse } from "../models/api/chrysalis/IMessageDetailsResponse";
import { ISearchResponse } from "../models/api/chrysalis/ISearchResponse";
import { ITransactionsCursor } from "../models/api/og/ITransactionsCursor";
import { TransactionsGetMode } from "../models/api/og/transactionsGetMode";
import { INetwork } from "../models/db/INetwork";

/**
 * Helper functions for use with tangle.
 */
export class TangleHelper {
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
        let nodeResult = cursor ? {} : await TangleHelper.searchApi(
            network.provider, network.user, network.password, false, network.bechHrp, query);

        // If there were no results from regular node and we have a permanode
        // or if there were output ids get any additional historic ones
        if (network.permaNodeEndpoint &&
            (Object.keys(nodeResult).length === 0 || nodeResult.addressOutputIds || nodeResult.indexMessageIds)) {
            const permaResult = await TangleHelper.searchApi(
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
     * Find item on the chrysalis network.
     * @param provider The provider for the REST API.
     * @param user The user for the for the REST API.
     * @param password The password for the REST API.
     * @param isPermanode Is this a permanode endpoint.
     * @param bechHrp The bech32 hrp for the network.
     * @param query The query to use for finding items.
     * @param cursor Cursor data to send with the request.
     * @returns The item found.
     */
    public static async searchApi(
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
        let queryLower = query.toLowerCase();

        try {
            // If the query is an integer then lookup a milestone
            if (/^\d+$/.test(query)) {
                const milestone = await client.milestone(Number.parseInt(query, 10));

                return {
                    milestone
                };
            }
        } catch {
        }

        try {
            // If the query is bech format lookup address
            if (Bech32Helper.matches(queryLower, bechHrp)) {
                // Permanode doesn't support the bech32 address endpoint so convert
                // the query to ed25519 format if thats what the type is
                // it will then be tried using the ed25519 address/outputs endpoint
                // later in this process
                if (isPermanode) {
                    const converted = Bech32Helper.fromBech32(queryLower, bechHrp);
                    if (converted.addressType === ED25519_ADDRESS_TYPE) {
                        queryLower = Converter.bytesToHex(converted.addressBytes);
                    }
                } else {
                    const address = await client.address(queryLower);
                    if (address) {
                        const addressOutputs = await client.addressOutputs(queryLower);

                        return {
                            address,
                            addressOutputIds: addressOutputs.outputIds
                        };
                    }
                }
            }
        } catch {
        }

        // If the query is 64 bytes hex, try and look for a message
        if (Converter.isHex(queryLower) && queryLower.length === 64) {
            try {
                const message = await client.message(queryLower);

                if (Object.keys(message).length > 0) {
                    return {
                        message
                    };
                }
            } catch (err) {
                console.error(err);
            }

            // If the query is 64 bytes hex, try and look for a transaction included message
            try {
                const message = await client.transactionIncludedMessage(queryLower);

                return {
                    message
                };
            } catch {
            }
        }

        try {
            // If the query is 68 bytes hex, try and look for an output
            if (Converter.isHex(queryLower) && queryLower.length === 68) {
                const output = await client.output(queryLower);

                return {
                    output
                };
            }
        } catch {
        }

        try {
            // If the query is bech format lookup address
            if (Converter.isHex(queryLower) && queryLower.length === 64) {
                // We have 64 characters hex so could possible be a raw ed25519 address

                // Permanode does not support the address/ed25519 endpoint
                // as it does not maintain utxo state, so we create a dummy
                // for permanode, but we can still get outputs for the address
                const address = isPermanode ? {
                    addressType: ED25519_ADDRESS_TYPE,
                    address: queryLower,
                    balance: 0,
                    dustAllowed: false
                } : await client.addressEd25519(queryLower);

                const addressOutputs = await client.addressEd25519Outputs(queryLower);

                if (addressOutputs.count > 0) {
                    const state = (addressOutputs as (IAddressOutputsResponse & {
                        state?: unknown;
                    })).state;

                    return {
                        address,
                        addressOutputIds: addressOutputs.outputIds,
                        cursor: state ? Converter.utf8ToHex(JSON.stringify(state)) : undefined
                    };
                }
            }
        } catch {
        }

        try {
            if (query.length > 0) {
                let messages: IMessagesResponse & { state?: string };
                let indexMessageType: "utf8" | "hex" | undefined;
                let cursorParam = "";

                if (cursor) {
                    cursorParam = `&state=${cursor}`;
                }

                // If the query is between 2 and 128 hex chars assume hex encoded bytes
                if (query.length >= 2 && query.length <= 128 && Converter.isHex(queryLower)) {
                    messages = await client.fetchJson<never, IMessagesResponse & { state?: string }>(
                        "get",
                        `messages?index=${queryLower}${cursorParam}`);

                    if (messages.count > 0) {
                        indexMessageType = "hex";
                    }
                }

                // If not already found and query less than 64 bytes assume its UTF8
                if (!indexMessageType && query.length <= 64) {
                    messages = await client.fetchJson<never, IMessagesResponse & { state?: string }>(
                        "get",
                        `messages?index=${Converter.utf8ToHex(queryLower)}${cursorParam}`);

                    if (messages.count > 0) {
                        indexMessageType = "utf8";
                    }
                }

                if (messages && messages.count > 0) {
                    return {
                        indexMessageIds: messages.messageIds,
                        indexMessageType,
                        cursor: messages.state
                    };
                }
            }
        } catch {
        }

        return {};
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
}
