import { IOutputsResponse } from "@iota/sdk-wasm-stardust/web";
import { FetchHelper } from "~helpers/fetchHelper";
import { IDIDResolverRequest } from "~models/api/IDIDResolverRequest";
import { IDIDResolverResponse } from "~models/api/IDIDResolverResponse";
import { IMilestoneDetailsRequest } from "~models/api/IMilestoneDetailsRequest";
import { INetworkBoundGetRequest } from "~models/api/INetworkBoundGetRequest";
import { IOutputDetailsRequest } from "~models/api/IOutputDetailsRequest";
import { IRawResponse } from "~models/api/IRawResponse";
import { IAddressBalanceRequest } from "~models/api/stardust/address/IAddressBalanceRequest";
import { IAddressBalanceResponse } from "~models/api/stardust/address/IAddressBalanceResponse";
import { IAddressDetailsRequest } from "~models/api/stardust/address/IAddressDetailsRequest";
import { IAddressDetailsResponse } from "~models/api/stardust/address/IAddressDetailsResponse";
import IAddressDetailsWithBalance from "~models/api/stardust/address/IAddressDetailsWithBalance";
import { IBlockDetailsRequest } from "~models/api/stardust/block/IBlockDetailsRequest";
import { IBlockDetailsResponse } from "~models/api/stardust/block/IBlockDetailsResponse";
import { IBlockRequest } from "~models/api/stardust/block/IBlockRequest";
import { IBlockResponse } from "~models/api/stardust/block/IBlockResponse";
import { IRichestAddressesResponse } from "~models/api/stardust/chronicle/IRichestAddressesResponse";
import { ITokenDistributionResponse } from "~models/api/stardust/chronicle/ITokenDistributionResponse";
import { IFoundriesRequest } from "~models/api/stardust/foundry/IFoundriesRequest";
import { IFoundriesResponse } from "~models/api/stardust/foundry/IFoundriesResponse";
import { IFoundryRequest } from "~models/api/stardust/foundry/IFoundryRequest";
import { IFoundryResponse } from "~models/api/stardust/foundry/IFoundryResponse";
import { IAliasRequest } from "~models/api/stardust/IAliasRequest";
import { IAliasResponse } from "~models/api/stardust/IAliasResponse";
import { IAssociationsRequest } from "~models/api/stardust/IAssociationsRequest";
import { IAssociationsResponse } from "~models/api/stardust/IAssociationsResponse";
import { IBlockChildrenRequest } from "~models/api/stardust/IBlockChildrenRequest";
import { IBlockChildrenResponse } from "~models/api/stardust/IBlockChildrenResponse";
import { ILatestMilestonesReponse } from "~models/api/stardust/ILatestMilestonesReponse";
import { IMilestoneBlocksResponse } from "~models/api/stardust/IMilestoneBlocksResponse";
import { IMilestoneDetailsResponse } from "~models/api/stardust/IMilestoneDetailsResponse";
import { IMilestoneStatsRequest } from "~models/api/stardust/IMilestoneStatsRequest";
import { IInfluxDailyResponse } from "~models/api/stardust/influx/IInfluxDailyResponse";
import { INodeInfoResponse } from "~models/api/stardust/INodeInfoResponse";
import { IOutputDetailsResponse } from "~models/api/stardust/IOutputDetailsResponse";
import { ISearchRequest } from "~models/api/stardust/ISearchRequest";
import { ISearchResponse } from "~models/api/stardust/ISearchResponse";
import { ITaggedOutputsRequest } from "~models/api/stardust/ITaggedOutputsRequest";
import { ITransactionDetailsRequest } from "~models/api/stardust/ITransactionDetailsRequest";
import { ITransactionDetailsResponse } from "~models/api/stardust/ITransactionDetailsResponse";
import { ITransactionHistoryRequest } from "~models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "~models/api/stardust/ITransactionHistoryResponse";
import { INftDetailsRequest } from "~models/api/stardust/nft/INftDetailsRequest";
import { INftDetailsResponse } from "~models/api/stardust/nft/INftDetailsResponse";
import { IParticipationEventRequest } from "~models/api/stardust/participation/IParticipationEventRequest";
import { IParticipationEventResponse } from "~models/api/stardust/participation/IParticipationEventResponse";
import { IAnalyticStats } from "~models/api/stats/IAnalyticStats";
import { IMilestoneAnalyticStats } from "~models/api/stats/IMilestoneAnalyticStats";
import { IStatsGetRequest } from "~models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "~models/api/stats/IStatsGetResponse";
import { ApiClient } from "../apiClient";

/**
 * Class to handle api communications on stardust.
 */
export class StardustApiClient extends ApiClient {
    /**
     * Perform a request to get the base token info for a network.
     * @param request The Base token request.
     * @returns The response from the request.
     */
    public async nodeInfo(request: INetworkBoundGetRequest): Promise<INodeInfoResponse> {
        return this.callApi<unknown, INodeInfoResponse>(`node-info/${request.network}`, "get");
    }

    /**
     * Get the balance of and address from chronicle.
     * @param request The Address Balance request.
     * @returns The Address balance reponse
     */
    public async addressBalance(request: IAddressBalanceRequest): Promise<IAddressDetailsWithBalance> {
        return this.callApi<unknown, IAddressDetailsWithBalance>(`stardust/balance/${request.network}/${request.address}`, "get");
    }

    /**
     * Get the balance of and address from chronicle.
     * @param request The Address Balance request.
     * @returns The Address balance reponse
     */
    public async addressBalanceChronicle(request: IAddressBalanceRequest): Promise<IAddressBalanceResponse> {
        return this.callApi<unknown, IAddressBalanceResponse>(`stardust/balance/chronicle/${request.network}/${request.address}`, "get");
    }

    /**
     * Get the basic outputs details of an address.
     * @param request The Address Basic outputs request.
     * @returns The Address outputs response
     */
    public async basicOutputsDetails(request: IAddressDetailsRequest): Promise<IAddressDetailsResponse> {
        return this.callApi<unknown, IAddressDetailsResponse>(
            `stardust/address/outputs/basic/${request.network}/${request.address}`,
            "get",
        );
    }

    /**
     * Get the alias outputs details of an address.
     * @param request The Address Basic outputs request.
     * @returns The Address outputs response
     */
    public async aliasOutputsDetails(request: IAddressDetailsRequest): Promise<IAddressDetailsResponse> {
        return this.callApi<unknown, IAddressDetailsResponse>(
            `stardust/address/outputs/alias/${request.network}/${request.address}`,
            "get",
        );
    }

    /**
     * Get the nft outputs details of an address.
     * @param request The Address Basic outputs request.
     * @returns The Address outputs response
     */
    public async nftOutputsDetails(request: IAddressDetailsRequest): Promise<IAddressDetailsResponse> {
        return this.callApi<unknown, IAddressDetailsResponse>(`stardust/address/outputs/nft/${request.network}/${request.address}`, "get");
    }

    /**
     * Find items from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async search(request: ISearchRequest): Promise<ISearchResponse> {
        return this.callApi<unknown, ISearchResponse>(`stardust/search/${request.network}/${request.query}`, "get");
    }

    /**
     * Get a block.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async block(request: IBlockRequest): Promise<IBlockResponse> {
        return this.callApi<unknown, IBlockResponse>(`stardust/block/${request.network}/${request.blockId}`, "get");
    }

    /**
     * Get the block details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async blockDetails(request: IBlockDetailsRequest): Promise<IBlockDetailsResponse> {
        return this.callApi<unknown, IBlockDetailsResponse>(`stardust/block/metadata/${request.network}/${request.blockId}`, "get");
    }

    /**
     * Get the block children.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async blockChildren(request: IBlockChildrenRequest): Promise<IBlockChildrenResponse> {
        return this.callApi<unknown, IBlockChildrenResponse>(`stardust/block/children/${request.network}/${request.blockId}`, "get");
    }

    /**
     * Get the transaction included block.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionIncludedBlockDetails(request: ITransactionDetailsRequest): Promise<ITransactionDetailsResponse> {
        return this.callApi<unknown, ITransactionDetailsResponse>(
            `stardust/transaction/${request.network}/${request.transactionId}`,
            "get",
        );
    }

    /**
     * Get the output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputDetails(request: IOutputDetailsRequest): Promise<IOutputDetailsResponse> {
        return this.callApi<unknown, IOutputDetailsResponse>(`stardust/output/${request.network}/${request.outputId}`, "get");
    }

    /**
     * Get the output ids by tag feature (basic or nft).
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputsByTag(request: ITaggedOutputsRequest): Promise<{ error?: string; outputs?: IOutputsResponse }> {
        const params = FetchHelper.urlParams({ cursor: request.cursor });

        return this.callApi<unknown, { error?: string; outputs?: IOutputsResponse }>(
            `stardust/output/tagged/${request.network}/${request.tag}/${request.outputType}${params}`,
            "get",
        );
    }

    /**
     * Get the associated outputs.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async associatedOutputs(request: IAssociationsRequest) {
        return this.callApi<unknown, IAssociationsResponse>(
            `stardust/output/associated/${request.network}/${request.addressDetails.bech32}`,
            "post",
            { addressDetails: request.addressDetails },
        );
    }

    /**
     * Get the milestone details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async milestoneDetails(request: IMilestoneDetailsRequest): Promise<IMilestoneDetailsResponse> {
        return this.callApi<unknown, IMilestoneDetailsResponse>(`stardust/milestone/${request.network}/${request.milestoneIndex}`, "get");
    }

    /**
     * Get the milestone analytics stats by milestone id.
     * @param request The milestone analytic stats get request.
     * @returns The milestone stats response.
     */
    public async milestoneStats(request: IMilestoneStatsRequest): Promise<IMilestoneAnalyticStats> {
        return this.callApi<unknown, IMilestoneAnalyticStats>(
            `stardust/milestone/stats/${request.network}/${request.milestoneIndex}`,
            "get",
        );
    }

    /**
     * Get the latest milestones.
     * @param network The network in context.
     * @returns The latest milestones response.
     */
    public async latestMilestones(network: string): Promise<ILatestMilestonesReponse> {
        return this.callApi<unknown, ILatestMilestonesReponse>(`stardust/milestone/latest/${network}`, "get");
    }

    /**
     * Get the blocks (Ids) referenced by a Milestone.
     * @param request The milestone analytic stats get request.
     * @param request.network The network in context.
     * @param request.milestoneId The milestone in context.
     * @returns The milestone referenced blocks.
     */
    public async milestoneReferencedBlocks(request: { network: string; milestoneId: string }): Promise<IMilestoneBlocksResponse> {
        return this.callApi<unknown, IMilestoneBlocksResponse>(
            `stardust/milestone/blocks/${request.network}/${request.milestoneId}`,
            "get",
        );
    }

    /**
     * Get the transaction history of an address (chronicle).
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionHistory(request: ITransactionHistoryRequest): Promise<ITransactionHistoryResponse> {
        const params = {
            pageSize: request.pageSize,
            sort: request.sort,
            startMilestoneIndex: request.startMilestoneIndex,
            cursor: request.cursor,
        };

        return this.callApi<unknown, ITransactionHistoryResponse>(
            `stardust/transactionhistory/${request.network}/${request.address}${FetchHelper.urlParams(params)}`,
            "get",
        );
    }

    /**
     * Download transaction history.
     * @param network The network in context.
     * @param address The address to download history for.
     * @param targetDate The date to use.
     * @returns The history.
     */
    public async transactionHistoryDownload(network: string, address: string, targetDate: string): Promise<IRawResponse> {
        return this.callApiRaw(`stardust/transactionhistory/dl/${network}/${address}`, "post", { targetDate });
    }

    /**
     * Get the nft details by NFT address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async nftDetails(request: INftDetailsRequest): Promise<INftDetailsResponse> {
        return this.callApi<unknown, INftDetailsResponse>(`stardust/nft/${request.network}/${request.nftId}`, "get");
    }

    /**
     * Get the alias output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async aliasDetails(request: IAliasRequest): Promise<IAliasResponse> {
        return this.callApi<unknown, IAliasResponse>(`stardust/alias/${request.network}/${request.aliasId}`, "get");
    }

    /**
     * Get the foundries controlled by an alias address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async aliasFoundries(request: IFoundriesRequest): Promise<IFoundriesResponse> {
        return this.callApi<unknown, IFoundriesResponse>(`stardust/alias/foundries/${request.network}/${request.aliasAddress}`, "get");
    }

    /**
     * Get the foundry output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async foundryDetails(request: IFoundryRequest): Promise<IFoundryResponse> {
        return this.callApi<unknown, IFoundryResponse>(`stardust/foundry/${request.network}/${request.foundryId}`, "get");
    }

    /**
     * Get the chronicle analytic stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async chronicleAnalytics(request: INetworkBoundGetRequest): Promise<IAnalyticStats> {
        return this.callApi<unknown, IAnalyticStats>(`stardust/analytics/${request.network}`, "get");
    }

    /**
     * Get the influx analytics stats.
     * @param request The request to send.
     * @param request.network The network to fetch for.
     * @returns The response from the request.
     */
    public async influxAnalytics(request: { network: string }): Promise<IInfluxDailyResponse> {
        return this.callApi<unknown, IInfluxDailyResponse>(`stardust/analytics/daily/${request.network}`, "get");
    }

    /**
     * Get the stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async stats(request: IStatsGetRequest): Promise<IStatsGetResponse> {
        return this.callApi<unknown, IStatsGetResponse>(
            `stats/${request.network}?includeHistory=${request.includeHistory ? "true" : "false"}`,
            "get",
        );
    }

    public async didDocument(request: IDIDResolverRequest): Promise<IDIDResolverResponse> {
        return this.callApi<unknown, IDIDResolverResponse>(`stardust/did/${request.network}/${request.did}/document`, "get");
    }

    /**
     * Get the participation events details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async participationEventDetails(request: IParticipationEventRequest): Promise<IParticipationEventResponse> {
        return this.callApi<unknown, IParticipationEventResponse>(
            `stardust/participation/events/${request.network}/${request.eventId}`,
            "get",
        );
    }

    /**
     * Get the richest addresses stats for a network.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async richestAddresses(request: INetworkBoundGetRequest): Promise<IRichestAddressesResponse> {
        return this.callApi<unknown, IRichestAddressesResponse>(`stardust/address/rich/${request.network}`, "get");
    }

    /**
     * Get the token distribution stats for a network.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async tokenDistribution(request: INetworkBoundGetRequest): Promise<ITokenDistributionResponse> {
        return this.callApi<unknown, ITokenDistributionResponse>(`stardust/token/distribution/${request.network}/`, "get");
    }
}
