/* eslint-disable no-warning-comments */
import { Blake2b } from "@iota/crypto.js-stardust";
import {
    addressBalance, IOutputResponse, serializeBlock, SingleNodeClient,
    IndexerPluginClient, blockIdFromMilestonePayload, milestoneIdFromMilestonePayload
} from "@iota/iota.js-stardust";
import { Converter, HexHelper, WriteStream } from "@iota/util.js-stardust";
import { ITransactionsDetailsRequest } from "../../models/api/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "../../models/api/ITransactionsDetailsResponse";
import { IBlockDetailsResponse } from "../../models/api/stardust/IBlockDetailsResponse";
import { IFoundryOutputsResponse } from "../../models/api/stardust/IFoundryOutputsResponse";
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
     * @returns The item found.
     */
    public static async search(network: INetwork, query: string): Promise<ISearchResponse> {
        return StardustTangleHelper.searchApi(network, query);
    }

    /**
     * Get the block details.
     * @param network The network to find the items on.
     * @param blockId The block id to get the details.
     * @returns The item details.
     */
    public static async blockDetails(network: INetwork, blockId: string): Promise<IBlockDetailsResponse> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });

            blockId = HexHelper.addPrefix(blockId);
            const metadata = await client.blockMetadata(blockId);
            const childrenResponse = await client.blockChildren(blockId);

            return {
                metadata,
                children: childrenResponse ? childrenResponse.children : undefined
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

                const metadata = await client.blockMetadata(blockId);
                const childrenResponse = await client.blockChildren(blockId);

                return {
                    metadata,
                    children: childrenResponse ? childrenResponse.children : undefined
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
            const blockId = blockIdFromMilestonePayload(2, milestonePayload);

            return {
                blockId,
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
            const blockId = blockIdFromMilestonePayload(2, milestonePayload);
            const milestoneId = milestoneIdFromMilestonePayload(milestonePayload);

            return {
                blockId,
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
     * Get the foundry outputs.
     * @param network The network to find the items on.
     * @param address The address to get the details for.
     * @returns The foundry outputs.
     */
    public static async foundryOutputs(
        network: INetwork,
        address: string
    ): Promise<IFoundryOutputsResponse | undefined> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });
            const indexerPlugin = new IndexerPluginClient(client);

            const foundryOutputs = await indexerPlugin.foundries({ aliasAddressBech32: address });
            return {
                outputs: foundryOutputs
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
     * @param query The query to use for finding items.
     * @returns The item found.
     */
    private static async searchApi(
        network: INetwork,
        query: string
    ): Promise<ISearchResponse> {
        const { provider, bechHrp, user, password } = network;
        const client = new SingleNodeClient(provider, { userName: user, password });
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

        if (searchQuery.blockIdOrTransactionId) {
            try {
                const block = await client.block(searchQuery.blockIdOrTransactionId);

                if (Object.keys(block).length > 0) {
                    return {
                        block
                    };
                }
            } catch {
            }

            try {
                const block = await client.transactionIncludedBlock(searchQuery.address.hex);

                if (Object.keys(block).length > 0) {
                    const writeStream = new WriteStream();
                    serializeBlock(writeStream, block);
                    const includedBlockId = Converter.bytesToHex(Blake2b.sum256(writeStream.finalBytes()));

                    return {
                        block,
                        includedBlockId
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
                        aliasOutput: await client.output(aliasOutputs.items[0])
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
                    return {
                        foundryOutputId: foundryOutputs.items[0]
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
                const addressBalanceDetails = await addressBalance(client, searchQuery.address.bech32);
                if (addressBalanceDetails) {
                    const addressDetails = {
                        ...addressBalanceDetails,
                        hex: searchQuery.address.hex,
                        bech32: searchQuery.address.bech32,
                        type: searchQuery.address.addressType
                    };

                    const addressOutputs = await indexerPlugin.outputs(
                        { addressBech32: searchQuery.address.bech32 }
                    );

                    return {
                        addressDetails,
                        addressOutputIds: addressOutputs.items
                    };
                }
            } catch {}
        }

        return {};
    }
}

