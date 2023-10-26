/* eslint-disable no-warning-comments */
import {
    OutputResponse, Client, IBlockMetadata, MilestonePayload, IOutputsResponse,
    HexEncodedString, Block, Utils, QueryParameter, NftQueryParameter, AliasQueryParameter, FoundryQueryParameter
} from "@iota/iota.js-stardust";
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
import { HexHelper } from "../hexHelper";
import { SearchExecutor } from "./searchExecutor";
import { SearchQueryBuilder, SearchQuery } from "./searchQueryBuilder";
import { addressBalance, blockIdFromMilestonePayload } from "./utils";

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
        const { bechHrp, provider } = network;
        const node = new Client({ nodes: [provider] });
        const searchQuery: SearchQuery = new SearchQueryBuilder(addressBech32, bechHrp).build();

        if (!searchQuery.address) {
            return undefined;
        }

        try {
            // Using ported balance from iota.js until it is added to iota-sdk https://github.com/iotaledger/iota-sdk/issues/604
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
        const block = await this.tryFetchNodeThenPermanode<string, Block>(
            blockId,
            "getBlock",
            network
        );

        if (!block) {
            return { error: `Couldn't find block with id ${blockId}` };
        }

        try {
            if (block && Object.keys(block).length > 0) {
                return {
                    block
                };
            }
        } catch (e) {
            logger.error(`Failed fetching block with block id ${blockId}. Cause: ${e}`);
            return { error: "Block fetch failed." };
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
            "getBlockMetadata",
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
        const block = await this.tryFetchNodeThenPermanode<string, Block>(
            transactionId,
            "getIncludedBlock",
            network
        );

        if (!block) {
            return { error: `Couldn't find block from transaction id ${transactionId}` };
        }

        try {
            if (block && Object.keys(block).length > 0) {
                return {
                    block
                };
            }
        } catch (e) {
            logger.error(`Failed fetching block with transaction id ${transactionId}. Cause: ${e}`);
        }
    }

    /**
     * Get the output details.
     * @param network The network to find the items on.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public static async outputDetails(network: INetwork, outputId: string): Promise<IOutputDetailsResponse> {
        const outputResponse = await this.tryFetchNodeThenPermanode<string, OutputResponse>(
            outputId,
            "getOutput",
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
    public static async outputsDetails(network: INetwork, outputIds: string[]): Promise<OutputResponse[]> {
        const promises: Promise<IOutputDetailsResponse>[] = [];
        const outputResponses: OutputResponse[] = [];

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
        const milestonePayload = await this.tryFetchNodeThenPermanode<string, MilestonePayload>(
            milestoneId,
            "getMilestoneById",
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
        const milestonePayload = await this.tryFetchNodeThenPermanode<number, MilestonePayload>(
            milestoneIndex,
            "getMilestoneByIndex",
            network
        );

        if (milestonePayload) {
            const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${network.network}`);
            const protocolVersion = nodeInfoService.getNodeInfo().protocolVersion;

            const blockId = blockIdFromMilestonePayload(protocolVersion, milestonePayload);
            const milestoneId = Utils.milestoneId(milestonePayload);

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
            const outputIdsResponse = await this.tryFetchNodeThenPermanode<QueryParameter[], IOutputsResponse>(
                [{ address: addressBech32 }, { cursor: cursor ?? "" }],
                "basicOutputIds",
                network
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
            const outputIdsResponse = await this.tryFetchNodeThenPermanode<AliasQueryParameter[], IOutputsResponse>(
                [{ stateController: addressBech32 }, { cursor: cursor ?? "" }],
                "aliasOutputIds",
                network
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
            const outputIdsResponse = await this.tryFetchNodeThenPermanode<NftQueryParameter[], IOutputsResponse>(
                [{ address: addressBech32 }, { cursor: cursor ?? "" }],
                "nftOutputIds",
                network
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
        const aliasOutputId = await this.tryFetchNodeThenPermanode<string, string>(
            aliasId,
            "aliasOutputId",
            network
        );

        if (aliasOutputId) {
            const outputResponse = await this.outputDetails(network, aliasOutputId);

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
            const response = await this.tryFetchNodeThenPermanode<FoundryQueryParameter[], IOutputsResponse>(
                [{ aliasAddress }],
                "foundryOutputIds",
                network
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
        const foundryOutputId = await this.tryFetchNodeThenPermanode<string, string>(
            foundryId,
            "foundryOutputId",
            network
        );

        if (foundryOutputId) {
            const outputResponse = await this.outputDetails(network, foundryOutputId);

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
            const nftOutputId = await this.tryFetchNodeThenPermanode<string, string>(
                nftId,
                "nftOutputId",
                network
            );

            if (nftOutputId) {
                const outputResponse = await this.outputDetails(network, nftOutputId);

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
            const params: NftQueryParameter[] = [{ tag: encodedTag }, { pageSize }, { cursor: cursor ?? "" }];
            const basicOutputIdsResponse: IOutputsResponse = await this.tryFetchNodeThenPermanode<
                QueryParameter[],
                IOutputsResponse
            >(
                params,
                "basicOutputIds",
                network
            );

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
            const params: NftQueryParameter[] = [{ tag: encodedTag }, { pageSize }, { cursor: cursor ?? "" }];
            const nftOutputIdsResponse: IOutputsResponse = await this.tryFetchNodeThenPermanode<
                NftQueryParameter[],
                IOutputsResponse
            >(
                params,
                "nftOutputIds",
                network
            );

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
        const basePluginPath: string = "api/participation/v1/";
        const method = "GET";
        const methodPath: string = `events/${eventId}`;
        const info = await this.nodePluginFetch<IParticipationEventInfo>(
            network,
            basePluginPath,
            method,
            methodPath
        );
        const status = await this.nodePluginFetch<IParticipationEventStatus>(
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
     * @returns The results or null if call(s) failed.
     */
    public static async tryFetchNodeThenPermanode<A, R>(
        args: A,
        methodName: string,
        network: INetwork
    ): Promise<R> | null {
        const {
            provider, permaNodeEndpoint, disableApiFallback
        } = network;
        const isFallbackEnabled = !disableApiFallback;
        const node = new Client({ nodes: [provider] });

        try {
            // try fetch from node
            const result: Promise<R> = node[methodName](args);
            return await result;
        } catch { }

        if (permaNodeEndpoint && isFallbackEnabled) {
            const permanode = new Client({ nodes: [permaNodeEndpoint] });

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
    private static async nodePluginFetch<S>(
        network: INetwork,
        basePluginPath: string,
        method: "GET" | "POST",
        methodPath: string,
        queryParams?: string[],
        request?: string
    ): Promise<S> | null {
        const { provider } = network;

        const client = new Client({ nodes: [provider] });

        try {
            const response: S = await client.callPluginRoute(
                basePluginPath,
                method,
                methodPath,
                queryParams,
                request
            ) as S;

            return response;
        } catch { }

        return null;
    }
}
