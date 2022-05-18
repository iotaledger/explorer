/* eslint-disable no-warning-comments */
import { Blake2b } from "@iota/crypto.js-stardust";
import {
    addressBalance, ED25519_ADDRESS_TYPE, IOutputResponse, IOutputsResponse, serializeMessage,
    SingleNodeClient, IndexerPluginClient, messageIdFromMilestonePayload, milestoneIdFromMilestonePayload
} from "@iota/iota.js-stardust";
import { Converter, HexHelper, WriteStream } from "@iota/util.js-stardust";
import bigInt from "big-integer";
import { ITransactionsDetailsRequest } from "../../models/api/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "../../models/api/ITransactionsDetailsResponse";
import { IMessageDetailsResponse } from "../../models/api/stardust/IMessageDetailsResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { INftOutputsResponse } from "../../models/api/stardust/INftOutputsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../fetchHelper";
import { SearchQueryBuilder, SearchQuery } from "./searchQueryBuilder";

/**
 * Helper functions for use with tangle.
 */
export class StardustTangleHelper {
    /**
     * Find item on the chrysalis network.
     * @param network The network to find the items on.
     * @param query The query to use for finding items.
     * @param cursor A cursor if are requesting subsequent pages.
     * @returns The item found.
     */
    public static async search(network: INetwork, query: string, cursor?: string): Promise<ISearchResponse> {
        // If we have a cursor this must be next page of permanode, so don't do the node lookup
        let nodeResult = cursor ? {} : await StardustTangleHelper.searchApi(network, false, query);

        // If there were no results from regular node and we have a permanode
        // or if there were output ids get any additional historic ones
        if (network.permaNodeEndpoint &&
            (Object.keys(nodeResult).length === 0 || nodeResult.addressOutputIds || nodeResult.indexMessageIds)) {
            const permaResult = await StardustTangleHelper.searchApi(network, true, query);

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
     * Get the milestone details by milestone id.
     * @param network The network to find the items on.
     * @param milestoneId The milestone id to get the details.
     * @returns The milestone details.
     */
    public static async milestoneDetailsById(
        network: INetwork, milestoneId: string
    ): Promise<IMilestoneDetailsResponse | undefined> {
        try {
            const client: SingleNodeClient = new SingleNodeClient(network.provider, {
                        userName: network.user,
                        password: network.password
                    });

            const milestonePayload = await client.milestoneById(milestoneId);
            /* eslint-disable-next-line no-warning-comments */
            // TODO Fetch protocol version from config/node
            const messageId = messageIdFromMilestonePayload(2, milestonePayload);

            return {
                messageId,
                milestoneId,
                milestone: milestonePayload
            };
        } catch {
        }
    }

    /**
     * Get the milestone details by index.
     * @param network The network to find the items on.
     * @param milestoneIndex The milestone index to get the details.
     * @returns The milestone details.
     */
    public static async milestoneDetailsByIndex(
        network: INetwork, milestoneIndex: number
    ): Promise<IMilestoneDetailsResponse | undefined> {
        try {
            const client: SingleNodeClient = network.permaNodeEndpoint
                /* eslint-disable-next-line no-warning-comments */
                // TODO Test this when permanode exists
                ? new SingleNodeClient(network.permaNodeEndpoint, {
                    userName: network.permaNodeEndpointUser,
                    password: network.permaNodeEndpointPassword,
                    basePath: "/"
                })
                    : new SingleNodeClient(network.provider, {
                        userName: network.user,
                        password: network.password
                    });

            const milestonePayload = await client.milestoneByIndex(milestoneIndex);
            /* eslint-disable-next-line no-warning-comments */
            // TODO Fetch protocol version from config/node
            const messageId = messageIdFromMilestonePayload(2, milestonePayload);
            const milestoneId = milestoneIdFromMilestonePayload(milestonePayload);

            return {
                messageId,
                milestoneId,
                milestone: milestonePayload
            };
        } catch {
        }
    }


    /**
     * Get the nft details.
     * @param network The network to find the items on.
     * @param address The address to get the details for.
     * @returns The nft details.
     */
    public static async nftOutputs(
        network: INetwork,
        address: string
    ): Promise<INftOutputsResponse | undefined> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });
            const indexerPlugin = new IndexerPluginClient(client);

            const nftOutputs = await indexerPlugin.nfts({ addressBech32: address });
            return {
                outputs: nftOutputs
            };
        } catch {}
    }

    /**
     * Get the nft details by nftId.
     * @param network The network to find the items on.
     * @param nftId The nftId to get the details for.
     * @returns The nft details.
     */
    public static async nftDetails(
        network: INetwork,
        nftId: string
    ): Promise<INftOutputsResponse | undefined> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });
            const indexerPlugin = new IndexerPluginClient(client);

            const nftOutputs = await indexerPlugin.nft(nftId);
            return {
                outputs: nftOutputs
            };
        } catch {}
    }

    /**
     * Find item on the stardust network.
     * @param network The network config.
     * @param isPermanode Is this a permanode endpoint.
     * @param query The query to use for finding items.
     * @returns The item found.
     */
    private static async searchApi(
        network: INetwork,
        isPermanode: boolean,
        query: string
    ): Promise<ISearchResponse> {
        const { provider, bechHrp, user, password } = network;
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

        if (searchQuery.milestoneIndex) {
            try {
                const milestoneDetails = await this.milestoneDetailsByIndex(network, searchQuery.milestoneIndex);
                return {
                    milestone: milestoneDetails
                };
            } catch {
            }
        }

        if (searchQuery.milestoneId) {
            try {
                const milestoneDetails = await this.milestoneDetailsById(network, searchQuery.milestoneId);
                if (milestoneDetails) {
                    return {
                        milestone: milestoneDetails
                    };
                }
            } catch {
            }
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

        if (searchQuery.aliasId) {
            try {
                const aliasOutputs = await indexerPlugin.alias(searchQuery.aliasId);
                if (aliasOutputs.items.length > 0) {
                    return {
                        output: await client.output(aliasOutputs.items[0])
                    };
                }
            } catch {}
        }

        if (searchQuery.nftId) {
            try {
                const nftOutputs = await indexerPlugin.nft(searchQuery.nftId);
                if (nftOutputs.items.length > 0) {
                    return {
                        output: await client.output(nftOutputs.items[0])
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
                    };
                }
            } catch {}
        }

        if (searchQuery.tag) {
            try {
                const taggedOutputs = await indexerPlugin.outputs({ tagHex: searchQuery.tag });

                if (taggedOutputs.items.length > 0) {
                    const output = await client.output(taggedOutputs.items[0]);

                    return {
                        output
                    };
                }
            } catch {}
        }

        if (searchQuery.address?.bech32) {
            try {
                if (isPermanode && searchQuery.address.addressType === ED25519_ADDRESS_TYPE) {
                    // Permanode doesn't support the bech32 address endpoint so convert
                    // the query to ed25519 format if thats what the type is
                    // it will then be tried using the ed25519 address/outputs endpoint
                    //
                    // TODO: Check this part when permanode is available
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
                    if (addressDetails) {
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

        return {};
    }
}

