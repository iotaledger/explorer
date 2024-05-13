import { OutputResponse, Client, IOutputsResponse, HexEncodedString, Utils, NftQueryParameter } from "@iota/sdk-stardust";
import { NodeInfoService } from "./nodeInfoService";
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
import { HexHelper } from "../../utils/hexHelper";
import { SearchExecutor } from "../../utils/stardust/searchExecutor";
import { SearchQuery, SearchQueryBuilder } from "../../utils/stardust/searchQueryBuilder";
import { addressBalance, blockIdFromMilestonePayload } from "../../utils/stardust/utils";

/**
 * Helper functions for use with tangle.
 */
export class StardustApiService {
    /**
     * The network in context.
     */
    private readonly network: INetwork;

    /**
     * The client to use for requests.
     */
    private readonly client: Client;

    constructor(network: INetwork) {
        this.network = network;
        this.client = ServiceFactory.get<Client>(`client-${network.network}`);
    }

    /**
     * Get the address details from iotajs.
     * @param addressBech32 The address to get the details for in bech32 format.
     * @returns The address details.
     */
    public async addressDetails(addressBech32: string): Promise<IAddressDetailsWithBalance | undefined> {
        const { bechHrp } = this.network;
        const searchQuery: SearchQuery = new SearchQueryBuilder(addressBech32, bechHrp).build();

        if (!searchQuery.address) {
            return undefined;
        }

        try {
            // Using ported balance from iota.js until it is added to iota-sdk https://github.com/iotaledger/iota-sdk/issues/604
            const addressBalanceDetails = await addressBalance(this.client, searchQuery.address.bech32);

            if (addressBalanceDetails) {
                const addressDetails = {
                    ...addressBalanceDetails,
                    hex: searchQuery.address.hex,
                    bech32: searchQuery.address.bech32,
                    type: searchQuery.address.type,
                };

                return addressDetails;
            }
        } catch {}
    }

    /**
     * Get a block.
     * @param blockId The block id to get the details.
     * @returns The block response.
     */
    public async block(blockId: string): Promise<IBlockResponse> {
        blockId = HexHelper.addPrefix(blockId);
        try {
            const block = await this.client.getBlock(blockId);

            if (!block) {
                return { error: `Couldn't find block with id ${blockId}` };
            }

            if (block && Object.keys(block).length > 0) {
                return {
                    block,
                };
            }
        } catch (e) {
            logger.error(`Failed fetching block with block id ${blockId}. Cause: ${e}`);
            return { error: "Block fetch failed." };
        }
    }

    /**
     * Get the block details.
     * @param blockId The block id to get the details.
     * @returns The item details.
     */
    public async blockDetails(blockId: string): Promise<IBlockDetailsResponse> {
        try {
            blockId = HexHelper.addPrefix(blockId);
            const metadata = await this.client.getBlockMetadata(blockId);

            if (metadata) {
                return {
                    metadata,
                };
            }
        } catch (e) {
            logger.error(`Failed fetching block metadata with block id ${blockId}. Cause: ${e}`);
            return { error: "Block metadata fetch failed." };
        }
    }

    /**
     * Get the transaction included block.
     * @param transactionId The transaction id to get the details.
     * @returns The item details.
     */
    public async transactionIncludedBlock(transactionId: string): Promise<ITransactionDetailsResponse> {
        transactionId = HexHelper.addPrefix(transactionId);
        try {
            const block = await this.client.getIncludedBlock(transactionId);

            if (!block) {
                return { error: `Couldn't find block from transaction id ${transactionId}` };
            }
            if (block && Object.keys(block).length > 0) {
                return {
                    block,
                };
            }
        } catch (e) {
            logger.error(`Failed fetching block with transaction id ${transactionId}. Cause: ${e}`);
            return { error: "Block fetch failed." };
        }
    }

    /**
     * Get the output details.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public async outputDetails(outputId: string): Promise<IOutputDetailsResponse> {
        try {
            const outputResponse = await this.client.getOutput(outputId);
            return { output: outputResponse };
        } catch (e) {
            logger.error(`Failed fetching output with output id ${outputId}. Cause: ${e}`);
            return { error: "Output not found" };
        }
    }

    /**
     * Get the outputs details.
     * @param outputIds The output ids to get the details.
     * @returns The item details.
     */
    public async outputsDetails(outputIds: string[]): Promise<OutputResponse[]> {
        const promises: Promise<IOutputDetailsResponse>[] = [];
        const outputResponses: OutputResponse[] = [];

        for (const outputId of outputIds) {
            const promise = this.outputDetails(outputId);
            promises.push(promise);
        }
        try {
            await Promise.all(promises).then((results) => {
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
     * @param milestoneId The milestone id to get the details.
     * @returns The milestone details.
     */
    public async milestoneDetailsById(milestoneId: string): Promise<IMilestoneDetailsResponse | undefined> {
        try {
            const milestonePayload = await this.client.getMilestoneById(milestoneId);

            if (milestonePayload) {
                const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${this.network.network}`);
                const protocolVersion = nodeInfoService.getNodeInfo().protocolVersion;
                const blockId = blockIdFromMilestonePayload(protocolVersion, milestonePayload);

                return {
                    blockId,
                    milestoneId,
                    milestone: milestonePayload,
                };
            }
        } catch (e) {
            logger.error(`Fetching milestone details failed. Cause: ${e}`);
        }
    }

    /**
     * Get the milestone details by index.
     * @param milestoneIndex The milestone index to get the details.
     * @returns The milestone details.
     */
    public async milestoneDetailsByIndex(milestoneIndex: number): Promise<IMilestoneDetailsResponse | undefined> {
        try {
            const milestonePayload = await this.client.getMilestoneByIndex(milestoneIndex);

            if (milestonePayload) {
                const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${this.network.network}`);
                const protocolVersion = nodeInfoService.getNodeInfo().protocolVersion;

                const blockId = blockIdFromMilestonePayload(protocolVersion, milestonePayload);
                const milestoneId = Utils.milestoneId(milestonePayload);

                return {
                    blockId,
                    milestoneId,
                    milestone: milestonePayload,
                };
            }
        } catch (e) {
            logger.error(`Fetching milestone details failed. Cause: ${e}`);
        }
    }

    /**
     * Get the relevant basic output details for an address.
     * @param addressBech32 The address in bech32 format.
     * @returns The basic output details.
     */
    public async basicOutputDetailsByAddress(addressBech32: string): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const expiredIds = await this.basicExpiredOutputIdsByAddress(addressBech32);
        const notClaimedIds = await this.basicNotClaimedOutputIdsByAddress(addressBech32);

        do {
            try {
                const outputIdsResponse = await this.client.basicOutputIds([{ address: addressBech32 }, { cursor: cursor ?? "" }]);

                outputIds = outputIds.concat(outputIdsResponse.items.filter((id) => !expiredIds.includes(id)));
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching basic output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        outputIds = outputIds.concat(notClaimedIds);
        const outputResponses = await this.outputsDetails(outputIds);

        return {
            outputs: outputResponses,
        };
    }

    /**
     * Get the relevant alias output details for an address.
     * @param addressBech32 The address in bech32 format.
     * @returns The alias output details.
     */
    public async aliasOutputDetailsByAddress(addressBech32: string): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];

        do {
            try {
                const outputIdsResponse = await this.client.aliasOutputIds([{ stateController: addressBech32 }, { cursor: cursor ?? "" }]);

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching alias output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        const outputResponses = await this.outputsDetails(outputIds);

        return {
            outputs: outputResponses,
        };
    }

    /**
     * Get the relevant nft output details for an address.
     * @param addressBech32 The address in bech32 format.
     * @returns The alias output details.
     */
    public async nftOutputDetailsByAddress(addressBech32: string): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const expiredIds = await this.nftExpiredOutputIdsByAddress(addressBech32);
        const notClaimedIds = await this.nftNotClaimedOutputIdsByAddress(addressBech32);

        do {
            try {
                const outputIdsResponse = await this.client.nftOutputIds([{ address: addressBech32 }, { cursor: cursor ?? "" }]);

                outputIds = outputIds.concat(outputIdsResponse.items.filter((id) => !expiredIds.includes(id)));
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching nft output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        outputIds = outputIds.concat(notClaimedIds);
        const outputResponses = await this.outputsDetails(outputIds);
        return {
            outputs: outputResponses,
        };
    }

    /**
     * Get the alias details.
     * @param aliasId The aliasId to get the details for.
     * @returns The alias details.
     */
    public async aliasDetails(aliasId: string): Promise<IAliasResponse | undefined> {
        try {
            const aliasOutputId = await this.client.aliasOutputId(aliasId);

            if (aliasOutputId) {
                const outputResponse = await this.outputDetails(aliasOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { aliasDetails: outputResponse.output };
            }
        } catch {
            return { message: "Alias output not found" };
        }
    }

    /**
     * Get controlled Foundry output id by controller Alias address
     * @param aliasAddress The alias address to get the controlled Foundries for.
     * @returns The foundry outputs.
     */
    public async aliasFoundries(aliasAddress: string): Promise<IFoundriesResponse | undefined> {
        try {
            const response = await this.client.foundryOutputIds([{ aliasAddress }]);

            if (response) {
                return {
                    foundryOutputsResponse: response,
                };
            }

            return { message: "Foundries output not found" };
        } catch {}
    }

    /**
     * Get the foundry details.
     * @param foundryId The foundryId to get the details for.
     * @returns The foundry details.
     */
    public async foundryDetails(foundryId: string): Promise<IFoundryResponse | undefined> {
        try {
            const foundryOutputId = await this.client.foundryOutputId(foundryId);

            if (foundryOutputId) {
                const outputResponse = await this.outputDetails(foundryOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { foundryDetails: outputResponse.output };
            }
            return { message: "Foundry output not found" };
        } catch {}
    }

    /**
     * Get the nft details by nftId.
     * @param nftId The nftId to get the details for.
     * @returns The nft details.
     */
    public async nftDetails(nftId: string): Promise<INftDetailsResponse | undefined> {
        try {
            const nftOutputId = await this.client.nftOutputId(nftId);

            if (nftOutputId) {
                const outputResponse = await this.outputDetails(nftOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { nftDetails: outputResponse.output };
            }

            return { message: "Nft output not found" };
        } catch {}
    }

    /**
     * Get the basic output Ids with specific tag feature.
     * @param encodedTag The tag hex.
     * @param pageSize The page size.
     * @param cursor The cursor for pagination.
     * @returns The basic outputs response.
     */
    public async taggedBasicOutputs(
        encodedTag: HexEncodedString,
        pageSize: number,
        cursor?: string,
    ): Promise<IBasicOutputsResponse | undefined> {
        try {
            const params: NftQueryParameter[] = [{ tag: encodedTag }, { pageSize }, { cursor: cursor ?? "" }];
            const basicOutputIdsResponse: IOutputsResponse = await this.client.basicOutputIds(params);

            if (basicOutputIdsResponse?.items.length > 0) {
                return { outputs: basicOutputIdsResponse };
            }
        } catch {}

        return { error: `Basic outputs not found with given tag ${encodedTag}` };
    }

    /**
     * Get the nft output Ids with specific tag feature.
     * @param encodedTag The tag hex.
     * @param pageSize The page size.
     * @param cursor The cursor for pagination.
     * @returns The nft outputs response.
     */
    public async taggedNftOutputs(
        encodedTag: HexEncodedString,
        pageSize: number,
        cursor?: string,
    ): Promise<INftOutputsResponse | undefined> {
        try {
            const params: NftQueryParameter[] = [{ tag: encodedTag }, { pageSize }, { cursor: cursor ?? "" }];
            const nftOutputIdsResponse: IOutputsResponse = await this.client.nftOutputIds(params);

            if (nftOutputIdsResponse?.items.length > 0) {
                return { outputs: nftOutputIdsResponse };
            }
        } catch {}

        return { error: `Nft outputs not found with given tag ${encodedTag}` };
    }

    /**
     * Get the output Ids (basic/nft) with specific tag feature.
     * @param tag The tag hex.
     * @returns .
     */
    public async taggedOutputs(tag: HexEncodedString): Promise<ITaggedOutputsResponse | undefined> {
        const basicOutputs = await this.taggedBasicOutputs(tag, 10);
        const nftOutputs = await this.taggedNftOutputs(tag, 10);

        return {
            basicOutputs,
            nftOutputs,
        };
    }

    /**
     * Get the relevant nft output details for an address.
     * @param eventId The id of the event.
     * @returns The participation event details.
     */
    public async participationEventDetails(eventId: string): Promise<IParticipationEventResponse | undefined> {
        const basePluginPath: string = "api/participation/v1/";
        const method = "GET";
        const methodPath: string = `events/${eventId}`;
        const info = await this.nodePluginFetch<IParticipationEventInfo>(basePluginPath, method, methodPath);
        const status = await this.nodePluginFetch<IParticipationEventStatus>(basePluginPath, method, `${methodPath}/status`);

        return {
            info,
            status,
        };
    }

    /**
     * Get the circulating supply from inx-supply-tracking (in base token).
     * @returns The circulating supply.
     */
    public async circulatingSupply(): Promise<number | null> {
        const path: string = "api/supply/v1/";
        const methodPath: string = "circulating";
        const method = "GET";
        const circulatingSupply: number | null = await this.nodePluginFetch<number | null>(path, method, methodPath);

        return circulatingSupply;
    }

    /**
     * Find item on the stardust network.
     * @param query The query to use for finding items.
     * @returns The item found.
     */
    public async search(query: string): Promise<ISearchResponse> {
        return new SearchExecutor(this.network, new SearchQueryBuilder(query, this.network.bechHrp).build()).run();
    }

    /**
     * Get the expired basic output ids for an address (outputs no longer owned by the address but by the expirationReturnAddress).
     * @param addressBech32 The address in bech32 format.
     * @returns The basic output ids.
     */
    private async basicExpiredOutputIdsByAddress(addressBech32: string): Promise<string[]> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const currentTimestamp = Math.floor(Date.now() / 1000);
        do {
            try {
                const outputIdsResponse = await this.client.basicOutputIds([
                    { address: addressBech32 },
                    { expiresBefore: currentTimestamp },
                    { cursor: cursor ?? "" },
                ]);

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching expired basic output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        return outputIds;
    }

    /**
     * Get the expired ntf output ids for an address (outputs no longer owned by the address but by the expirationReturnAddress).
     * @param addressBech32 The address in bech32 format.
     * @returns The nft output ids.
     */
    private async nftExpiredOutputIdsByAddress(addressBech32: string): Promise<string[]> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const currentTimestamp = Math.floor(Date.now() / 1000);
        do {
            try {
                const outputIdsResponse = await this.client.nftOutputIds([
                    { address: addressBech32 },
                    { expiresBefore: currentTimestamp },
                    { cursor: cursor ?? "" },
                ]);

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching expired nft output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        return outputIds;
    }

    /**
     * Get the not claimed basic output ids for an address (outputs owned by the expirationReturnAddress).
     * @param expirationReturnAddress The address in bech32 format.
     * @returns The nft output ids.
     */
    private async basicNotClaimedOutputIdsByAddress(expirationReturnAddress: string): Promise<string[]> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const currentTimestamp = Math.floor(Date.now() / 1000);

        do {
            try {
                const outputIdsResponse = await this.client.basicOutputIds([
                    { expirationReturnAddress },
                    { expiresBefore: currentTimestamp },
                    { cursor: cursor ?? "" },
                ]);

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching not claimed nft output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        return outputIds;
    }

    /**
     * Get the not claimed ntf output ids for an address (outputs owned by the expirationReturnAddress).
     * @param expirationReturnAddress The address in bech32 format.
     * @returns The nft output ids.
     */
    private async nftNotClaimedOutputIdsByAddress(expirationReturnAddress: string): Promise<string[]> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const currentTimestamp = Math.floor(Date.now() / 1000);

        do {
            try {
                const outputIdsResponse = await this.client.nftOutputIds([
                    { expirationReturnAddress },
                    { expiresBefore: currentTimestamp },
                    { cursor: cursor ?? "" },
                ]);

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching not claimed nft output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        return outputIds;
    }

    /**
     * Extension method which provides request methods for plugins.
     * @param basePluginPath The base path for the plugin eg indexer/v1/ .
     * @param method The http method.
     * @param methodPath The path for the plugin request.
     * @param queryParams Additional query params for the request.
     * @param request The request object.
     * @returns The response object.
     */
    private async nodePluginFetch<S>(
        basePluginPath: string,
        method: "GET" | "POST",
        methodPath: string,
        queryParams?: string[],
        request?: string,
    ): Promise<S> | null {
        const client = this.client;

        try {
            const response: S = (await client.callPluginRoute(basePluginPath, method, methodPath, queryParams, request)) as S;

            return response;
        } catch {}

        return null;
    }
}
