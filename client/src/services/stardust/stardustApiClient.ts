import { FetchHelper } from "../../helpers/fetchHelper";
import { IIdentityStardustResolveRequest } from "../../models/api/IIdentityStardustResolveRequest";
import { IIdentityStardustResolveResponse } from "../../models/api/IIdentityStardustResolveResponse";
import { IMilestoneDetailsRequest } from "../../models/api/IMilestoneDetailsRequest";
import { IOutputDetailsRequest } from "../../models/api/IOutputDetailsRequest";
import { IRawResponse } from "../../models/api/IRawResponse";
import { IFoundriesRequest } from "../../models/api/stardust/foundry/IFoundriesRequest";
import { IFoundriesResponse } from "../../models/api/stardust/foundry/IFoundriesResponse";
import { IFoundryRequest } from "../../models/api/stardust/foundry/IFoundryRequest";
import { IFoundryResponse } from "../../models/api/stardust/foundry/IFoundryResponse";
import { IAddressBalanceRequest } from "../../models/api/stardust/IAddressBalanceRequest";
import { IAddressBalanceResponse } from "../../models/api/stardust/IAddressBalanceResponse";
import IAddressDetailsWithBalance from "../../models/api/stardust/IAddressDetailsWithBalance";
import { IAddressOutputsRequest } from "../../models/api/stardust/IAddressOutputsRequest";
import { IAddressOutputsResponse } from "../../models/api/stardust/IAddressOutputsResponse";
import { IAliasRequest } from "../../models/api/stardust/IAliasRequest";
import { IAliasResponse } from "../../models/api/stardust/IAliasResponse";
import { IAssociationsRequest } from "../../models/api/stardust/IAssociationsRequest";
import { IAssociationsResponse } from "../../models/api/stardust/IAssociationsResponse";
import { IBlockDetailsRequest } from "../../models/api/stardust/IBlockDetailsRequest";
import { IBlockDetailsResponse } from "../../models/api/stardust/IBlockDetailsResponse";
import { IBlockRequest } from "../../models/api/stardust/IBlockRequest";
import { IBlockResponse } from "../../models/api/stardust/IBlockResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { IMilestoneStatsRequest } from "../../models/api/stardust/IMilestoneStatsRequest";
import { IBlocksDailyResponse } from "../../models/api/stardust/influx/IBlocksDailyResponse";
import { INodeInfoRequest } from "../../models/api/stardust/INodeInfoRequest";
import { INodeInfoResponse } from "../../models/api/stardust/INodeInfoResponse";
import { IOutputDetailsResponse } from "../../models/api/stardust/IOutputDetailsResponse";
import { ISearchRequest } from "../../models/api/stardust/ISearchRequest";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITransactionDetailsRequest } from "../../models/api/stardust/ITransactionDetailsRequest";
import { ITransactionDetailsResponse } from "../../models/api/stardust/ITransactionDetailsResponse";
import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { INftDetailsRequest } from "../../models/api/stardust/nft/INftDetailsRequest";
import { INftDetailsResponse } from "../../models/api/stardust/nft/INftDetailsResponse";
import { INftOutputsRequest } from "../../models/api/stardust/nft/INftOutputsRequest";
import { INftOutputsResponse } from "../../models/api/stardust/nft/INftOutputsResponse";
import { INftRegistryDetailsRequest } from "../../models/api/stardust/nft/INftRegistryDetailsRequest";
import { INftRegistryDetailsResponse } from "../../models/api/stardust/nft/INftRegistryDetailsResponse";
import { IAnalyticStats } from "../../models/api/stats/IAnalyticStats";
import { IAnalyticStatsRequest } from "../../models/api/stats/IAnalyticStatsRequest";
import { IMilestoneAnalyticStats } from "../../models/api/stats/IMilestoneAnalyticStats";
import { IShimmerClaimedResponse } from "../../models/api/stats/IShimmerClaimed";
import { IStatsGetRequest } from "../../models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/stats/IStatsGetResponse";
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
    public async nodeInfo(request: INodeInfoRequest): Promise<INodeInfoResponse> {
        return this.callApi<unknown, INodeInfoResponse>(
            `node-info/${request.network}`,
            "get"
        );
    }

    /**
     * Get the balance of and address from chronicle.
     * @param request The Address Balance request.
     * @returns The Address balance reponse
     */
    public async addressBalance(request: IAddressBalanceRequest): Promise<IAddressDetailsWithBalance> {
        return this.callApi<unknown, IAddressDetailsWithBalance>(
            `stardust/balance/${request.network}/${request.address}`,
            "get"
        );
    }

    /**
     * Get the balance of and address from chronicle.
     * @param request The Address Balance request.
     * @returns The Address balance reponse
     */
    public async addressBalanceChronicle(request: IAddressBalanceRequest): Promise<IAddressBalanceResponse> {
        return this.callApi<unknown, IAddressBalanceResponse>(
            `stardust/balance/chronicle/${request.network}/${request.address}`,
            "get"
        );
    }

    /**
     * Get the unspent output ids of an address.
     * @param request The Address Basic outputs request.
     * @returns The Address outputs response
     */
    public async addressOutputs(request: IAddressOutputsRequest): Promise<IAddressOutputsResponse> {
        return this.callApi<unknown, IAddressOutputsResponse>(
            `stardust/address/outputs/${request.network}/${request.address}`,
            "get"
        );
    }

    /**
     * Find items from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async search(request: ISearchRequest): Promise<ISearchResponse> {
        return this.callApi<unknown, ISearchResponse>(
            `stardust/search/${request.network}/${request.query}`,
            "get"
        );
    }

    /**
     * Get a block.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async block(request: IBlockRequest): Promise<IBlockResponse> {
        return this.callApi<unknown, IBlockResponse>(
            `stardust/block/${request.network}/${request.blockId}`, "get"
        );
    }

    /**
     * Get the block details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async blockDetails(request: IBlockDetailsRequest): Promise<IBlockDetailsResponse> {
        return this.callApi<unknown, IBlockDetailsResponse>(
            `stardust/block/metadata/${request.network}/${request.blockId}`, "get"
        );
    }

    /**
     * Get the transaction included block.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionIncludedBlockDetails(
        request: ITransactionDetailsRequest
    ): Promise<ITransactionDetailsResponse> {
        return this.callApi<unknown, ITransactionDetailsResponse>(
            `stardust/transaction/${request.network}/${request.transactionId}`, "get"
        );
    }

    /**
     * Get the output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputDetails(request: IOutputDetailsRequest): Promise<IOutputDetailsResponse> {
        return this.callApi<unknown, IOutputDetailsResponse>(
            `stardust/output/${request.network}/${request.outputId}`, "get"
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
            { addressDetails: request.addressDetails }
        );
    }

    /**
     * Get the milestone details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async milestoneDetails(request: IMilestoneDetailsRequest): Promise<IMilestoneDetailsResponse> {
        return this.callApi<unknown, IMilestoneDetailsResponse>(
            `stardust/milestone/${request.network}/${request.milestoneIndex}`,
            "get"
        );
    }

    /**
     * Get the milestone analytics stats by milestone id.
     * @param request The milestone analytic stats get request.
     * @returns The milestone stats response.
     */
    public async milestoneStats(request: IMilestoneStatsRequest): Promise<IMilestoneAnalyticStats> {
        return this.callApi<unknown, IMilestoneAnalyticStats>(
            `stardust/milestone/stats/${request.networkId}/${request.milestoneId}`,
            "get"
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
            cursor: request.cursor
        };

        return this.callApi<unknown, ITransactionHistoryResponse>(
            `stardust/transactionhistory/${request.network}/${request.address}${FetchHelper.urlParams(params)}`,
            "get"
        );
    }

    /**
     * Download transaction history.
     * @param network The network in context.
     * @param address The address to download history for.
     * @param timespan The timespan to download.
     * @returns The history.
     */
    public async transactionHistoryDownload(
        network: string,
        address: string,
        timespan: string
    ): Promise<IRawResponse> {
        return this.callApiRaw(
            `stardust/transactionhistory/dl/${network}/${address}`,
            "post",
            { timespan }
        );
    }

    /**
     * Get the nfts of an address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async nftOutputs(request: INftOutputsRequest): Promise<INftOutputsResponse> {
        return this.callApi<unknown, INftOutputsResponse>(
            `stardust/nft/outputs/${request.network}/${request.address}`,
            "get"
        );
    }

    /**
     * Get the nft details by NFT address.
     * @param request The request to send.
     * @returns The response from the request.
     */
     public async nftDetails(request: INftDetailsRequest): Promise<INftDetailsResponse> {
        return this.callApi<unknown, INftDetailsResponse>(
            `stardust/nft/${request.network}/${request.nftId}`,
            "get"
        );
    }

    /**
     * Get the nft details (mock).
     * @param request The request to send.
     * @returns The response from the request.
     */
     public async nftRegistryDetails(request: INftRegistryDetailsRequest): Promise<INftRegistryDetailsResponse> {
        return this.callApi<unknown, INftRegistryDetailsResponse>(
            `stardust/nft/mock/${request.network}/${request.nftId}`,
            "get"
        );
    }

    /**
     * Get the alias output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async aliasDetails(request: IAliasRequest): Promise<IAliasResponse> {
        return this.callApi<unknown, IAliasResponse>(
            `stardust/alias/${request.network}/${request.aliasId}`,
            "get"
        );
    }

    /**
     * Get the foundries controlled by an alias address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async aliasFoundries(request: IFoundriesRequest): Promise<IFoundriesResponse> {
        return this.callApi<unknown, IFoundriesResponse>(
            `stardust/alias/foundries/${request.network}/${request.aliasAddress}`,
            "get"
        );
    }

    /**
     * Get the foundry output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async foundryDetails(request: IFoundryRequest): Promise<IFoundryResponse> {
        return this.callApi<unknown, IFoundryResponse>(
            `stardust/foundry/${request.network}/${request.foundryId}`,
            "get"
        );
    }

    /**
     * Get the chronicle analytic stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async analytics(request: IAnalyticStatsRequest): Promise<IAnalyticStats> {
        return this.callApi<unknown, IAnalyticStats>(`stardust/analytics/${request.network}`, "get");
    }

    /**
     * Get the shimmer claiming stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async shimmerClaimingAnalytics(request: IAnalyticStatsRequest): Promise<IShimmerClaimedResponse> {
        return this.callApi<unknown, IShimmerClaimedResponse>(
            `stardust/analytics/shimmer/${request.network}`, "get"
        );
    }

    public async influxAnalytics(request: { network: string }): Promise<IBlocksDailyResponse > {
        return this.callApi<unknown, IBlocksDailyResponse>(
            `stardust/analytics/blocks/daily/${request.network}`, "get"
        );
    }

    /**
     * Get the stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async stats(request: IStatsGetRequest): Promise<IStatsGetResponse> {
        return this.callApi<unknown, IStatsGetResponse>(
            `stats/${request.network}?includeHistory=${request.includeHistory ? "true" : "false"}`,
            "get"
        );
    }

    public async didDocument(request: IIdentityStardustResolveRequest): Promise<IIdentityStardustResolveResponse> {
        return this.callApi<unknown, IIdentityStardustResolveResponse>(
            `stardust/did/${request.network}/${request.did}/document`,
            "get"
        );
    }
}
