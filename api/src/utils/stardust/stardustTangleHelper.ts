/* eslint-disable no-warning-comments */
import {
    addressBalance, IOutputResponse, SingleNodeClient,
    IndexerPluginClient, blockIdFromMilestonePayload, milestoneIdFromMilestonePayload,
    IBlockMetadata, IMilestonePayload, IBlock
} from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { IBlockDetailsResponse } from "../../models/api/stardust/IBlockDetailsResponse";
import { IFoundriesResponse } from "../../models/api/stardust/IFoundriesResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { INftOutputsResponse } from "../../models/api/stardust/INftOutputsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITransactionDetailsResponse } from "../../models/api/stardust/ITransactionDetailsResponse";
import { INetwork } from "../../models/db/INetwork";
import { SearchQueryBuilder, SearchQuery } from "./searchQueryBuilder";

/**
 * Helper functions for use with tangle.
 */
export class StardustTangleHelper {
    /**
     * Get the block details.
     * @param network The network to find the items on.
     * @param blockId The block id to get the details.
     * @returns The item details.
     */
    public static async blockDetails(network: INetwork, blockId: string): Promise<IBlockDetailsResponse> {
        blockId = HexHelper.addPrefix(blockId);
        const metadata = await this.tryFetchPermanodeThenNode<string, IBlockMetadata>(
            blockId,
            "blockMetadata",
            network
        );

        if (metadata) {
            return {
                metadata
            };
        }
    }

    /**
     * Get the transaction included block.
     * @param network The network to find the items on.
     * @param transactionId The transaction id to get the details.
     * @returns The item details.
     */
    public static async transactionIncludedBlock(
        network: INetwork,
        transactionId: string
    ): Promise<ITransactionDetailsResponse> {
        transactionId = HexHelper.addPrefix(transactionId);
        const block = await this.tryFetchPermanodeThenNode<string, IBlock>(
            transactionId,
            "transactionIncludedBlock",
            network
        );

        if (block) {
            return {
                block
            };
        }
    }

    /**
     * Get the output details.
     * @param network The network to find the items on.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public static async outputDetails(network: INetwork, outputId: string): Promise<IOutputResponse | undefined> {
        const outputResponse = await this.tryFetchPermanodeThenNode<string, IOutputResponse>(
            outputId,
            "output",
            network
        );

        if (outputResponse) {
            return outputResponse;
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
        const milestonePayload = await this.tryFetchPermanodeThenNode<string, IMilestonePayload>(
            milestoneId,
            "milestoneById",
            network
        );

        if (milestonePayload) {
            // TODO Fetch protocol version from config/node
            const blockId = blockIdFromMilestonePayload(2, milestonePayload);

            return {
                blockId,
                milestoneId,
                milestone: milestonePayload
            };
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
        const milestonePayload = await this.tryFetchPermanodeThenNode<number, IMilestonePayload>(
            milestoneIndex,
            "milestoneByIndex",
            network
        );

        if (milestonePayload) {
            // TODO Fetch protocol version from config/node
            const blockId = blockIdFromMilestonePayload(2, milestonePayload);
            const milestoneId = milestoneIdFromMilestonePayload(milestonePayload);

            return {
                blockId,
                milestoneId,
                milestone: milestonePayload
            };
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
        const { provider, user, password } = network;
        try {
            const node = new SingleNodeClient(provider, { userName: user, password });
            const indexerPlugin = new IndexerPluginClient(node);
            const nftOutputs = await indexerPlugin.nfts({ addressBech32: address });

            return {
                outputs: nftOutputs
            };
        } catch {}
    }

    /**
     * Get controlled Foundry output id by controller Alias address
     * @param network The network to find the items on.
     * @param aliasAddress The alias address to get the controlled Foundries for.
     * @returns The foundry outputs.
     */
    public static async aliasFoundries(
        network: INetwork,
        aliasAddress: string
    ): Promise<IFoundriesResponse | undefined> {
        const { provider, user, password } = network;
        try {
            const node = new SingleNodeClient(provider, { userName: user, password });
            const indexerPlugin = new IndexerPluginClient(node);
            const foundryOutputsResponse = await indexerPlugin.foundries({ aliasAddressBech32: aliasAddress });

            return {
                foundryOutputsResponse
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
        const { provider, user, password } = network;
        try {
            const node = new SingleNodeClient(provider, { userName: user, password });
            const indexerPlugin = new IndexerPluginClient(node);
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
    public static async search(
        network: INetwork,
        query: string
    ): Promise<ISearchResponse> {
        const {
            bechHrp, provider, user, password
        } = network;
        const node = new SingleNodeClient(provider, { userName: user, password });
        const indexerPlugin = new IndexerPluginClient(node);

        const searchQuery: SearchQuery = new SearchQueryBuilder(query, bechHrp).build();

        if (searchQuery.did) {
            return {
                did: searchQuery.did
            };
        }

        if (searchQuery.milestoneIndex) {
            const milestoneDetails = await this.milestoneDetailsByIndex(network, searchQuery.milestoneIndex);
            return {
                milestone: milestoneDetails
            };
        }

        if (searchQuery.milestoneId) {
            const milestoneDetails = await this.milestoneDetailsById(network, searchQuery.milestoneId);
            if (milestoneDetails) {
                return {
                    milestone: milestoneDetails
                };
            }
        }

        if (searchQuery.blockId) {
            const block = await this.tryFetchPermanodeThenNode<string, IBlock>(
                searchQuery.blockId,
                "block",
                network
            );

            if (block && Object.keys(block).length > 0) {
                return {
                    block
                };
            }
        }

        if (searchQuery.transactionId) {
            const block = await this.tryFetchPermanodeThenNode<string, IBlock>(
                searchQuery.transactionId,
                "transactionIncludedBlock",
                network
            );

            if (block && Object.keys(block).length > 0) {
                return {
                    transactionBlock: block
                };
            }
        }

        if (searchQuery.output) {
            const output = await this.tryFetchPermanodeThenNode<string, IOutputResponse>(
                searchQuery.output,
                "output",
                network
            );

            if (output) {
                return { output };
            }
        }

        if (searchQuery.aliasId) {
            try {
                const aliasOutputs = await indexerPlugin.alias(searchQuery.aliasId);

                if (aliasOutputs.items.length > 0) {
                    return {
                        aliasOutputId: aliasOutputs.items[0]
                    };
                }
            } catch {}
        }

        if (searchQuery.nftId) {
            try {
                const nftOutputs = await indexerPlugin.nft(searchQuery.nftId);
                if (nftOutputs.items.length > 0) {
                    return {
                        nftOutputId: nftOutputs.items[0]
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
                    return {
                        taggedOutputs
                    };
                }
            } catch {}
        }

        if (searchQuery.address?.bech32) {
            try {
                const addressBalanceDetails = await addressBalance(node, searchQuery.address.bech32);

                if (addressBalanceDetails) {
                    const addressDetails = {
                        ...addressBalanceDetails,
                        hex: searchQuery.address.hex,
                        bech32: searchQuery.address.bech32,
                        type: searchQuery.address.addressType
                    };

                    let cursor: string | undefined;
                    let addressOutputIds: string[] = [];
                    do {
                        const outputIdsResponse = await indexerPlugin.outputs(
                            { addressBech32: searchQuery.address.bech32, cursor }
                        );
                        addressOutputIds = addressOutputIds.concat(outputIdsResponse.items);
                        cursor = outputIdsResponse.cursor;
                    } while (cursor);

                    return {
                        addressDetails,
                        addressOutputIds
                    };
                }
            } catch {}
        }

        return {};
    }

    /**
     * Generic helper function to try fetching from permanode client (if configured).
     * On failure (or not present), we try to fetch from node.
     * @param args The argument(s) to pass to the fetch calls.
     * @param methodName The function to call on the clients.
     * @param network The network config in context.
     * @returns The results or null if call(s) failed.
     */
    private static async tryFetchPermanodeThenNode<A, R>(
        args: A,
        methodName: string,
        network: INetwork
    ): Promise<R> | null {
        const {
            provider, user, password,
            permaNodeEndpoint, permaNodeEndpointUser, permaNodeEndpointPassword
        } = network;
        if (permaNodeEndpoint) {
            try {
                const permanode = new SingleNodeClient(
                    permaNodeEndpoint,
                    { userName: permaNodeEndpointUser, password: permaNodeEndpointPassword }
                );

                // try fetch from permanode (chronicle)
                const result: Promise<R> = permanode[methodName](args);
                return await result;
            } catch {}
        }

        const node = new SingleNodeClient(provider, { userName: user, password });

        try {
            // try fetch from node
            const result: Promise<R> = node[methodName](args);
            return await result;
        } catch {}

        return null;
    }
}

