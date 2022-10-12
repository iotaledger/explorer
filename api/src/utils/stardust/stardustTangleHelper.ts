/* eslint-disable no-warning-comments */
import {
    addressBalance, IOutputResponse, SingleNodeClient,
    IndexerPluginClient, blockIdFromMilestonePayload, milestoneIdFromMilestonePayload,
    IBlockMetadata, IMilestonePayload, IOutputsResponse, deserializeBlock
} from "@iota/iota.js-stardust";
import { HexHelper, ReadStream } from "@iota/util.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFoundriesResponse } from "../../models/api/stardust/foundry/IFoundriesResponse";
import { IFoundryResponse } from "../../models/api/stardust/foundry/IFoundryResponse";
import { IAddressBasicOutputsResponse } from "../../models/api/stardust/IAddressBasicOutputsResponse";
import IAddressDetailsWithBalance from "../../models/api/stardust/IAddressDetailsWithBalance";
import { IAliasResponse } from "../../models/api/stardust/IAliasResponse";
import { IBlockDetailsResponse } from "../../models/api/stardust/IBlockDetailsResponse";
import { IBlockResponse } from "../../models/api/stardust/IBlockResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITransactionDetailsResponse } from "../../models/api/stardust/ITransactionDetailsResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/milestone/IMilestoneDetailsResponse";
import { INftDetailsResponse } from "../../models/api/stardust/nft/INftDetailsResponse";
import { INftOutputsResponse } from "../../models/api/stardust/nft/INftOutputsResponse";
import { INetwork } from "../../models/db/INetwork";
import { NodeInfoService } from "../../services/stardust/nodeInfoService";
import { SearchQueryBuilder, SearchQuery } from "./searchQueryBuilder";

/**
 * Helper functions for use with tangle.
 */
export class StardustTangleHelper {
    /**
     * Get the address details from iotajs.
     * @param network The network in context.
     * @param addressBech32 The address to get the details for in bech32 format.
     * @returns The address details.
     */
    public static async addressDetails(
        network: INetwork, addressBech32: string
    ): Promise<IAddressDetailsWithBalance | undefined> {
        const { bechHrp, provider, user, password } = network;
        const node = new SingleNodeClient(provider, { userName: user, password });
        const searchQuery: SearchQuery = new SearchQueryBuilder(addressBech32, bechHrp).build();

        if (!searchQuery.address) {
            return undefined;
        }

        try {
            const addressBalanceDetails = await addressBalance(node, searchQuery.address.bech32);

            if (addressBalanceDetails) {
                const addressDetails = {
                    ...addressBalanceDetails,
                    hex: searchQuery.address.hex,
                    bech32: searchQuery.address.bech32,
                    type: searchQuery.address.type
                };

                return addressDetails;
            }
        } catch { }
    }

    /**
     * Get a block.
     * @param network The network to find the items on.
     * @param blockId The block id to get the details.
     * @returns The block response.
     */
    public static async block(network: INetwork, blockId: string): Promise<IBlockResponse> {
        blockId = HexHelper.addPrefix(blockId);
        const blockRaw = await this.tryFetchPermanodeThenNode<string, Uint8Array>(
            blockId,
            "blockRaw",
            network
        );

        if (!blockRaw) {
            return { error: `Couldn't find block with id ${blockId}` };
        }

        try {
            const block = deserializeBlock(new ReadStream(blockRaw));
            if (block && Object.keys(block).length > 0) {
                return {
                    block
                };
            }
        } catch (e) {
            console.log(`Block deserialization failed for block with block id ${blockId}.`, e);
            return { error: "Block deserialization failed." };
        }
    }

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
        const blockRaw = await this.tryFetchPermanodeThenNode<string, Uint8Array>(
            transactionId,
            "transactionIncludedBlockRaw",
            network
        );

        if (!blockRaw) {
            return { error: `Couldn't find block from transaction id ${transactionId}` };
        }

        try {
            const block = deserializeBlock(new ReadStream(blockRaw));
            if (block) {
                return {
                    block
                };
            }
        } catch (e) {
            console.log(`Block deserialization failed for block with transaction id ${transactionId}.`, e);
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
            const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${network.network}`);
            const protocolVersion = nodeInfoService.getNodeInfo().protocolVersion;
            const blockId = blockIdFromMilestonePayload(protocolVersion, milestonePayload);

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
            const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${network.network}`);
            const protocolVersion = nodeInfoService.getNodeInfo().protocolVersion;

            const blockId = blockIdFromMilestonePayload(protocolVersion, milestonePayload);
            const milestoneId = milestoneIdFromMilestonePayload(milestonePayload);

            return {
                blockId,
                milestoneId,
                milestone: milestonePayload
            };
        }
    }

    /**
     * Get the relevant upspent output ids for an address.
     * @param network The network to find the items on.
     * @param addressBech32 The address in bech32 format.
     * @returns The output ids.
     */
    public static async outputIdsByAddress(
        network: INetwork, addressBech32: string
    ): Promise<IAddressBasicOutputsResponse | undefined> {
        let cursor: string | undefined;
        let outputIds: string[] = [];

        do {
            const outputIdsResponse = await this.tryFetchPermanodeThenNode<Record<string, unknown>, IOutputsResponse>(
                { addressBech32, cursor },
                "basicOutputs",
                network,
                true
            );

            outputIds = outputIds.concat(outputIdsResponse.items);
            cursor = outputIdsResponse.cursor;
        } while (cursor);

        cursor = undefined;

        do {
            const nftOutputs = await this.tryFetchPermanodeThenNode<Record<string, unknown>, IOutputsResponse>(
                { addressBech32, cursor },
                "nfts",
                network,
                true
            );

            outputIds = outputIds.concat(nftOutputs.items);
            cursor = nftOutputs.cursor;
        } while (cursor);

        cursor = undefined;

        do {
            const aliasOutputs = await this.tryFetchPermanodeThenNode<Record<string, unknown>, IOutputsResponse>(
                { governorBech32: addressBech32, cursor },
                "aliases",
                network,
                true
            );

            outputIds = outputIds.concat(aliasOutputs.items);
            cursor = aliasOutputs.cursor;
        } while (cursor);

        return {
            outputIds
        };
    }

    /**
     * Get the alias details.
     * @param network The network to find the items on.
     * @param aliasId The aliasId to get the details for.
     * @returns The alias details.
     */
    public static async aliasDetails(
        network: INetwork,
        aliasId: string
    ): Promise<IAliasResponse | undefined> {
        const aliasOutput = await this.tryFetchPermanodeThenNode<string, IOutputsResponse>(
            aliasId,
            "alias",
            network,
            true
        );

        if (aliasOutput.items.length > 0) {
            const aliasDetails = await this.outputDetails(network, aliasOutput.items[0]);

            if (aliasDetails) {
                return {
                    aliasDetails
                };
            }
        }
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
        try {
            const response = await this.tryFetchPermanodeThenNode<Record<string, unknown>, IOutputsResponse>(
                { aliasAddressBech32: aliasAddress },
                "foundries",
                network,
                true
            );

            if (response) {
                return {
                    foundryOutputsResponse: response
                };
            }
        } catch { }
    }

    /**
     * Get the foundry details.
     * @param network The network to find the items on.
     * @param foundryId The foundryId to get the details for.
     * @returns The foundry details.
     */
    public static async foundryDetails(
        network: INetwork,
        foundryId: string
    ): Promise<IFoundryResponse | undefined> {
        const foundryOutput = await this.tryFetchPermanodeThenNode<string, IOutputsResponse>(
            foundryId,
            "foundry",
            network,
            true
        );

        if (foundryOutput.items.length > 0) {
            const foundryDetails = await this.outputDetails(network, foundryOutput.items[0]);

            if (foundryDetails) {
                return {
                    foundryDetails
                };
            }
        }
    }

    /**
     * Get the nft outputs by address.
     * @param network The network to find the items on.
     * @param address The address to get the details for.
     * @returns The nft details.
     */
    public static async nftOutputs(
        network: INetwork,
        address: string
    ): Promise<INftOutputsResponse | undefined> {
        try {
            const nftOutputs = await this.tryFetchPermanodeThenNode<Record<string, unknown>, IOutputsResponse>(
                { addressBech32: address },
                "nfts",
                network,
                true
            );

            if (nftOutputs) {
                return {
                    outputs: nftOutputs
                };
            }
        } catch { }
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
    ): Promise<INftDetailsResponse | undefined> {
        try {
            const nftOutputs = await this.tryFetchPermanodeThenNode<string, IOutputsResponse>(
                nftId,
                "nft",
                network,
                true
            );

            if (nftOutputs.items.length > 0) {
                const nftDetails = await this.outputDetails(network, nftOutputs.items[0]);

                if (nftDetails) {
                    return {
                        nftDetails
                    };
                }
            }
        } catch { }
    }

    /**
     * Find item on the stardust network.
     * @param network The network config.
     * @param bechHrp The bech32 human readable part of the network.
     * @param query The query to use for finding items.
     * @returns The item found.
     */
    public static async search(
        network: INetwork,
        bechHrp: string,
        query: string
    ): Promise<ISearchResponse> {
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
            return StardustTangleHelper.block(network, searchQuery.blockId);
        }

        if (searchQuery.transactionId) {
            const blockRaw = await this.tryFetchPermanodeThenNode<string, Uint8Array>(
                searchQuery.transactionId,
                "transactionIncludedBlockRaw",
                network
            );

            if (blockRaw) {
                try {
                    const block = deserializeBlock(new ReadStream(blockRaw));
                    if (block && Object.keys(block).length > 0) {
                        return {
                            transactionBlock: block
                        };
                    }
                } catch (e) {
                    console.log(
                        `Block deserialization failed for block with transaction id ${searchQuery.transactionId}.`,
                        e
                    );
                }
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
                const aliasOutputs = await this.tryFetchPermanodeThenNode<string, IOutputsResponse>(
                    searchQuery.aliasId,
                    "alias",
                    network,
                    true
                );

                if (aliasOutputs.items.length > 0) {
                    return {
                        aliasId: searchQuery.aliasId
                    };
                }
            } catch { }
        }

        if (searchQuery.nftId) {
            try {
                const nftOutputs = await this.tryFetchPermanodeThenNode<string, IOutputsResponse>(
                    searchQuery.nftId,
                    "nft",
                    network,
                    true
                );

                if (nftOutputs.items.length > 0) {
                    return {
                        nftId: searchQuery.nftId
                    };
                }
            } catch { }
        }

        if (searchQuery.foundryId) {
            try {
                const foundryOutputs = await this.tryFetchPermanodeThenNode<string, IOutputsResponse>(
                    searchQuery.foundryId,
                    "foundry",
                    network,
                    true
                );

                if (foundryOutputs.items.length > 0) {
                    return {
                        foundryId: searchQuery.foundryId
                    };
                }
            } catch { }
        }

        if (searchQuery.tag) {
            try {
                const taggedOutputs = await this.tryFetchPermanodeThenNode<Record<string, unknown>, IOutputsResponse>(
                    { tagHex: searchQuery.tag },
                    "basicOutputs",
                    network,
                    true
                );

                if (taggedOutputs.items.length > 0) {
                    return {
                        taggedOutputs
                    };
                }
            } catch { }
        }

        if (searchQuery.address?.bech32) {
            return {
                addressDetails: searchQuery.address
            };
        }

        return {};
    }

    /**
     * Generic helper function to try fetching from permanode client (if configured).
     * On failure (or not present), we try to fetch from node.
     * @param args The argument(s) to pass to the fetch calls.
     * @param methodName The function to call on the client.
     * @param network The network config in context.
     * @param isIndexerCall The boolean flag for indexer api instead of core api.
     * @returns The results or null if call(s) failed.
     */
    private static async tryFetchPermanodeThenNode<A, R>(
        args: A,
        methodName: string,
        network: INetwork,
        isIndexerCall: boolean = false
    ): Promise<R> | null {
        const {
            provider, user, password, permaNodeEndpoint,
            permaNodeEndpointUser, permaNodeEndpointPassword, disableApiFallback
        } = network;
        const isFallbackEnabled = !disableApiFallback;

        if (permaNodeEndpoint) {
            const permanode = !isIndexerCall ?
                new SingleNodeClient(
                    permaNodeEndpoint,
                    { userName: permaNodeEndpointUser, password: permaNodeEndpointPassword }
                ) :
                new IndexerPluginClient(
                    new SingleNodeClient(
                        permaNodeEndpoint,
                        { userName: permaNodeEndpointUser, password: permaNodeEndpointPassword }
                    )
                );

            try {
                // try fetch from permanode (chronicle)
                const result: Promise<R> = permanode[methodName](args);
                return await result;
            } catch { }
        }

        if (!permaNodeEndpoint || isFallbackEnabled) {
            const node = !isIndexerCall ?
                new SingleNodeClient(provider, { userName: user, password }) :
                new IndexerPluginClient(
                    new SingleNodeClient(provider, { userName: user, password })
                );

            try {
                // try fetch from node
                const result: Promise<R> = node[methodName](args);
                return await result;
            } catch { }
        }

        return null;
    }
}

