/* eslint-disable no-warning-comments */
import {
    addressBalance, IOutputResponse, SingleNodeClient,
    IndexerPluginClient, blockIdFromMilestonePayload, milestoneIdFromMilestonePayload,
    IBlockMetadata, IMilestonePayload, IOutputsResponse, deserializeBlock, HexEncodedString
} from "@iota/iota.js-stardust";
import { HexHelper, ReadStream } from "@iota/util.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { IBasicOutputsResponse } from "../../models/api/stardust/basic/IBasicOutputsResponse";
import { IFoundriesResponse } from "../../models/api/stardust/foundry/IFoundriesResponse";
import { IFoundryResponse } from "../../models/api/stardust/foundry/IFoundryResponse";
import { IAddressDetailsResponse } from "../../models/api/stardust/IAddressDetailsResponse";
import IAddressDetailsWithBalance from "../../models/api/stardust/IAddressDetailsWithBalance";
import { IAliasResponse } from "../../models/api/stardust/IAliasResponse";
import { IBlockDetailsResponse } from "../../models/api/stardust/IBlockDetailsResponse";
import { IBlockResponse } from "../../models/api/stardust/IBlockResponse";
import { IOutputDetailsResponse } from "../../models/api/stardust/IOutputDetailsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITaggedOutputsResponse } from "../../models/api/stardust/ITaggedOutputsResponse";
import { ITransactionDetailsResponse } from "../../models/api/stardust/ITransactionDetailsResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/milestone/IMilestoneDetailsResponse";
import { INftDetailsResponse } from "../../models/api/stardust/nft/INftDetailsResponse";
import { INftOutputsResponse } from "../../models/api/stardust/nft/INftOutputsResponse";
import { IParticipationEventInfo } from "../../models/api/stardust/participation/IParticipationEventInfo";
import { IParticipationEventResponse } from "../../models/api/stardust/participation/IParticipationEventResponse";
import { IParticipationEventStatus } from "../../models/api/stardust/participation/IParticipationEventStatus";
import { INetwork } from "../../models/db/INetwork";
import { NodeInfoService } from "../../services/stardust/nodeInfoService";
import { SearchExecutor } from "./searchExecutor";
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
        const blockRaw = await this.tryFetchNodeThenPermanode<string, Uint8Array>(
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
            logger.error(`Block deserialization failed for block with block id ${blockId}. Cause: ${e}`);
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
        const metadata = await this.tryFetchNodeThenPermanode<string, IBlockMetadata>(
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
        const blockRaw = await this.tryFetchNodeThenPermanode<string, Uint8Array>(
            transactionId,
            "transactionIncludedBlockRaw",
            network
        );

        if (!blockRaw) {
            return { error: `Couldn't find block from transaction id ${transactionId}` };
        }

        try {
            const block = deserializeBlock(new ReadStream(blockRaw));
            if (block && Object.keys(block).length > 0) {
                return {
                    block
                };
            }
        } catch (e) {
            logger.error(`Block deserialization failed for block with transaction id ${transactionId}. Cause: ${e}`);
        }
    }

    /**
     * Get the output details.
     * @param network The network to find the items on.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public static async outputDetails(network: INetwork, outputId: string): Promise<IOutputDetailsResponse> {
        const outputResponse = await this.tryFetchNodeThenPermanode<string, IOutputResponse>(
            outputId,
            "output",
            network
        );

        return outputResponse ?
            { output: outputResponse } :
            { message: "Output not found" };
    }

    /**
     * Get the outputs details.
     * @param network The network to find the items on.
     * @param outputIds The output ids to get the details.
     * @returns The item details.
     */
    public static async outputsDetails(network: INetwork, outputIds: string[]): Promise<IOutputResponse[]> {
        const promises: Promise<IOutputDetailsResponse>[] = [];
        const outputResponses: IOutputResponse[] = [];

        for (const outputId of outputIds) {
            const promise = this.outputDetails(network, outputId);
            promises.push(promise);
        }
        try {
            await Promise.all(promises)
                .then(results => {
                    for (const outputDetails of results) {
                        if (outputDetails.output?.output && outputDetails.output?.metadata) {
                            outputResponses.push(outputDetails.output);
                        }
                    }
                });

            return outputResponses;
        } catch (e) {
            logger.error(`Fetching outputs details failed. Cause: ${e}`);
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
        const milestonePayload = await this.tryFetchNodeThenPermanode<string, IMilestonePayload>(
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
        const milestonePayload = await this.tryFetchNodeThenPermanode<number, IMilestonePayload>(
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
     * Get the relevant basic output details for an address.
     * @param network The network to find the items on.
     * @param addressBech32 The address in bech32 format.
     * @returns The basic output details.
     */
    public static async basicOutputDetailsByAddress(
        network: INetwork, addressBech32: string
    ): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];

        do {
            const outputIdsResponse = await this.tryFetchNodeThenPermanode<Record<string, unknown>, IOutputsResponse>(
                { addressBech32, cursor },
                "basicOutputs",
                network,
                true
            );

            outputIds = outputIds.concat(outputIdsResponse.items);
            cursor = outputIdsResponse.cursor;
        } while (cursor);

        const outputResponses = await this.outputsDetails(network, outputIds);

        return {
            outputs: outputResponses
        };
    }

    /**
     * Get the relevant alias output details for an address.
     * @param network The network to find the items on.
     * @param addressBech32 The address in bech32 format.
     * @returns The alias output details.
     */
    public static async aliasOutputDetailsByAddress(
        network: INetwork, addressBech32: string
    ): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];

        do {
            const outputIdsResponse = await this.tryFetchNodeThenPermanode<Record<string, unknown>, IOutputsResponse>(
                { stateControllerBech32: addressBech32, cursor },
                "aliases",
                network,
                true
            );

            outputIds = outputIds.concat(outputIdsResponse.items);
            cursor = outputIdsResponse.cursor;
        } while (cursor);

        const outputResponses = await this.outputsDetails(network, outputIds);

        return {
            outputs: outputResponses
        };
    }

    /**
     * Get the relevant nft output details for an address.
     * @param network The network to find the items on.
     * @param addressBech32 The address in bech32 format.
     * @returns The alias output details.
     */
    public static async nftOutputDetailsByAddress(
        network: INetwork, addressBech32: string
    ): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];

        do {
            const outputIdsResponse = await this.tryFetchNodeThenPermanode<Record<string, unknown>, IOutputsResponse>(
                { addressBech32, cursor },
                "nfts",
                network,
                true
            );

            outputIds = outputIds.concat(outputIdsResponse.items);
            cursor = outputIdsResponse.cursor;
        } while (cursor);

        const outputResponses = await this.outputsDetails(network, outputIds);
        return {
            outputs: outputResponses
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
        const aliasOutput = await this.tryFetchNodeThenPermanode<string, IOutputsResponse>(
            aliasId,
            "alias",
            network,
            true
        );

        if (aliasOutput?.items.length > 0) {
            const outputResponse = await this.outputDetails(network, aliasOutput.items[0]);

            return !outputResponse.error ?
                { aliasDetails: outputResponse.output } :
                { error: outputResponse.error };
        }

        return { message: "Alias output not found" };
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
            const response = await this.tryFetchNodeThenPermanode<Record<string, unknown>, IOutputsResponse>(
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

            return { message: "Foundries output not found" };
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
        const foundryOutput = await this.tryFetchNodeThenPermanode<string, IOutputsResponse>(
            foundryId,
            "foundry",
            network,
            true
        );

        if (foundryOutput?.items.length > 0) {
            const outputResponse = await this.outputDetails(network, foundryOutput.items[0]);

            return !outputResponse.error ?
                { foundryDetails: outputResponse.output } :
                { error: outputResponse.error };
        }

        return { message: "Foundry output not found" };
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
            const nftOutputs = await this.tryFetchNodeThenPermanode<string, IOutputsResponse>(
                nftId,
                "nft",
                network,
                true
            );

            if (nftOutputs?.items.length > 0) {
                const outputResponse = await this.outputDetails(network, nftOutputs.items[0]);

                return !outputResponse.error ?
                    { nftDetails: outputResponse.output } :
                    { error: outputResponse.error };
            }

            return { message: "Nft output not found" };
        } catch { }
    }

    /**
     * Get the basic output Ids with specific tag feature.
     * @param network The network to find the items on.
     * @param encodedTag The tag hex.
     * @param pageSize The page size.
     * @param cursor The cursor for pagination.
     * @returns The basic outputs response.
     */
    public static async taggedBasicOutputs(
        network: INetwork,
        encodedTag: HexEncodedString,
        pageSize: number,
        cursor?: string
    ): Promise<IBasicOutputsResponse | undefined> {
        try {
            const basicOutputIdsResponse: IOutputsResponse = await this.tryFetchNodeThenPermanode<
                Record<string, unknown>,
                IOutputsResponse
            >({ tagHex: encodedTag, pageSize, cursor }, "basicOutputs", network, true);

            if (basicOutputIdsResponse?.items.length > 0) {
                return { outputs: basicOutputIdsResponse };
            }
        } catch { }

        return { error: `Basic outputs not found with given tag ${encodedTag}` };
    }

    /**
     * Get the nft output Ids with specific tag feature.
     * @param network The network to find the items on.
     * @param encodedTag The tag hex.
     * @param pageSize The page size.
     * @param cursor The cursor for pagination.
     * @returns The nft outputs response.
     */
    public static async taggedNftOutputs(
        network: INetwork,
        encodedTag: HexEncodedString,
        pageSize: number,
        cursor?: string
    ): Promise<INftOutputsResponse | undefined> {
        try {
            const nftOutputIdsResponse: IOutputsResponse = await this.tryFetchNodeThenPermanode<
                Record<string, unknown>,
                IOutputsResponse
            >({ tagHex: encodedTag, pageSize, cursor }, "nfts", network, true);

            if (nftOutputIdsResponse?.items.length > 0) {
                return { outputs: nftOutputIdsResponse };
            }
        } catch { }

        return { error: `Nft outputs not found with given tag ${encodedTag}` };
    }

    /**
     * Get the output Ids (basic/nft) with specific tag feature.
     * @param network The network to find the items on.
     * @param tag The tag hex.
     * @returns .
     */
    public static async taggedOutputs(
        network: INetwork,
        tag: HexEncodedString
    ): Promise<ITaggedOutputsResponse | undefined> {
        const basicOutputs = await this.taggedBasicOutputs(network, tag, 10);
        const nftOutputs = await this.taggedNftOutputs(network, tag, 10);

        return {
            basicOutputs,
            nftOutputs
        };
    }

    /**
     * Get the relevant nft output details for an address.
     * @param network The network to find the items on.
     * @param eventId The id of the event.
     * @returns The participation event details.
     */
    public static async participationEventDetails(
        network: INetwork, eventId: string
    ): Promise<IParticipationEventResponse | undefined> {
        const basePluginPath: string = "participation/v1/";
        const method = "get";
        const methodPath: string = `events/${eventId}`;
        const info = await this.nodePluginFetch<unknown, IParticipationEventInfo>(
            network,
            basePluginPath,
            method,
            methodPath
        );
        const status = await this.nodePluginFetch<unknown, IParticipationEventStatus>(
            network,
            basePluginPath,
            method,
            `${methodPath}/status`
        );

        return {
            info,
            status
        };
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
        return new SearchExecutor(
            network,
            new SearchQueryBuilder(query, network.bechHrp).build()
        ).run();
    }

    /**
     * Generic helper function to try fetching from node client.
     * On failure (or not present), we try to fetch from permanode (if configured).
     * @param args The argument(s) to pass to the fetch calls.
     * @param methodName The function to call on the client.
     * @param network The network config in context.
     * @param isIndexerCall The boolean flag for indexer api instead of core api.
     * @returns The results or null if call(s) failed.
     */
    public static async tryFetchNodeThenPermanode<A, R>(
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

        if (permaNodeEndpoint && isFallbackEnabled) {
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

        return null;
    }

    /**
     * Extension method which provides request methods for plugins.
     * @param network The network config in context.
     * @param basePluginPath The base path for the plugin eg indexer/v1/ .
     * @param method The http method.
     * @param methodPath The path for the plugin request.
     * @param queryParams Additional query params for the request.
     * @param request The request object.
     * @returns The response object.
     */
    private static async nodePluginFetch<T, S>(
        network: INetwork,
        basePluginPath: string,
        method: "get" | "post" | "delete",
        methodPath: string,
        queryParams?: string[],
        request?: T
    ): Promise<S> | null {
        const { provider, user, password } = network;

        const client = new SingleNodeClient(provider, { userName: user, password });
        try {
            const result: S = await client.pluginFetch<T, S>(
                basePluginPath,
                method,
                methodPath,
                queryParams,
                request
            );
            return result;
        } catch { }

        return null;
    }
}
