import { OutputsResponse } from "@iota/sdk-wasm-nova/web";
import { INetworkBoundGetRequest } from "~/models/api/INetworkBoundGetRequest";
import { IAddressBalanceRequest } from "~/models/api/nova/address/IAddressBalanceRequest";
import { IAddressBalanceResponse } from "~/models/api/nova/address/IAddressBalanceResponse";
import { IBlockRequest } from "~/models/api/nova/block/IBlockRequest";
import { IBlockResponse } from "~/models/api/nova/block/IBlockResponse";
import { IOutputDetailsRequest } from "~/models/api/IOutputDetailsRequest";
import { IAccountDetailsRequest } from "~/models/api/nova/IAccountDetailsRequest";
import { IAccountDetailsResponse } from "~/models/api/nova/IAccountDetailsResponse";
import { IAssociationsResponse } from "~/models/api/nova/IAssociationsResponse";
import { INodeInfoResponse } from "~/models/api/nova/INodeInfoResponse";
import { IOutputDetailsResponse } from "~/models/api/nova/IOutputDetailsResponse";
import { IAssociationsRequest } from "~/models/api/nova/IAssociationsRequest";
import { ApiClient } from "../apiClient";
import { IBlockDetailsRequest } from "~/models/api/nova/block/IBlockDetailsRequest";
import { IBlockDetailsResponse } from "~/models/api/nova/block/IBlockDetailsResponse";
import { IRewardsRequest } from "~/models/api/nova/IRewardsRequest";
import { IRewardsResponse } from "~/models/api/nova/IRewardsResponse";
import { IStatsGetRequest } from "~/models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "~/models/api/stats/IStatsGetResponse";
import { INftDetailsRequest } from "~/models/api/nova/INftDetailsRequest";
import { INftDetailsResponse } from "~/models/api/nova/INftDetailsResponse";
import { IAnchorDetailsRequest } from "~/models/api/nova/IAnchorDetailsRequest";
import { IAnchorDetailsResponse } from "~/models/api/nova/IAnchorDetailsResponse";
import { IFoundryRequest } from "~/models/api/nova/foundry/IFoundryRequest";
import { IFoundryResponse } from "~/models/api/nova/foundry/IFoundryResponse";
import { ISearchRequest } from "~/models/api/nova/ISearchRequest";
import { ISearchResponse } from "~/models/api/nova/ISearchResponse";
import { IAddressDetailsRequest } from "~/models/api/nova/address/IAddressDetailsRequest";
import { IAddressDetailsResponse } from "~/models/api/nova/address/IAddressDetailsResponse";
import { IFoundriesResponse } from "~/models/api/nova/foundry/IFoundriesResponse";
import { IFoundriesRequest } from "~/models/api/nova/foundry/IFoundriesRequest";
import { ITransactionHistoryRequest } from "~/models/api/nova/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "~/models/api/nova/ITransactionHistoryResponse";
import { FetchHelper } from "~/helpers/fetchHelper";
import { ISlotRequest } from "~/models/api/nova/ISlotRequest";
import { ISlotResponse } from "~/models/api/nova/ISlotResponse";
import { ITransactionDetailsRequest } from "~/models/api/nova/ITransactionDetailsRequest";
import { ITransactionDetailsResponse } from "~/models/api/nova/ITransactionDetailsResponse";
import { ICongestionRequest } from "~/models/api/nova/ICongestionRequest";
import { ICongestionResponse } from "~/models/api/nova/ICongestionResponse";
import { IAccountValidatorDetailsRequest } from "~/models/api/nova/IAccountValidatorDetailsRequest";
import { IAccountValidatorDetailsResponse } from "~/models/api/nova/IAccountValidatorDetailsResponse";
import { ILatestSlotCommitmentResponse } from "~/models/api/nova/ILatestSlotCommitmentsResponse";
import { IDelegationDetailsResponse } from "~/models/api/nova/IDelegationDetailsResponse";
import { ISlotBlocksRequest } from "~/models/api/nova/ISlotBlocksRequest";
import { ISlotBlocksResponse } from "~/models/api/nova/ISlotBlocksResponse";
import { IEpochCommitteeRequest } from "~/models/api/nova/IEpochCommitteeRequest";
import { IEpochCommitteeResponse } from "~/models/api/nova/IEpochCommitteeResponse";
import { IInfluxDailyResponse } from "~/models/api/nova/influx/IInfluxDailyResponse";
import { ITransactionMetadataResponse } from "~/models/api/nova/ITransactionMetadataResponse";
import { IAnalyticStats } from "~/models/api/nova/stats/IAnalyticStats";
import { IValidatorsResponse } from "~/models/api/nova/IValidatorsResponse";
import { ITaggedOutputsRequest } from "~/models/api/nova/ITaggedOutputsRequest";
import { IEpochAnalyticStats } from "~/models/api/nova/stats/IEpochAnalyticStats";
import { IEpochAnalyticStatsRequest } from "~/models/api/nova/stats/IEpochAnalyticStatsRequest";
import { IValidatorStatsResponse } from "~/models/api/nova/IValidatorStatsResponse";
import { IDelegationByValidatorResponse } from "~/models/api/nova/IDelegationByValidatorResponse";
import { ISlotManaBurnedRequest } from "~/models/api/nova/stats/ISlotManaBurnedRequest";
import { ISlotManaBurnedResponse } from "~/models/api/nova/stats/ISlotManaBurnedResponse";
import { ISlotAnalyticStatsRequest } from "~/models/api/nova/stats/ISlotAnalyticStatsRequest";
import { ISlotAnalyticStatsResponse } from "~/models/api/nova/stats/ISlotAnalyticStatsResponse";

/**
 * Class to handle api communications on nova.
 */
export class NovaApiClient extends ApiClient {
    /**
     * Perform a request to get the base token info for the network.
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
    public async addressBalanceChronicle(request: IAddressBalanceRequest): Promise<IAddressBalanceResponse> {
        return this.callApi<unknown, IAddressBalanceResponse>(`nova/balance/chronicle/${request.network}/${request.address}`, "get");
    }

    /**
     * Get a block.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async block(request: IBlockRequest): Promise<IBlockResponse> {
        return this.callApi<unknown, IBlockResponse>(`nova/block/${request.network}/${request.blockId}`, "get");
    }

    /**
     * Get the block details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async blockDetails(request: IBlockDetailsRequest): Promise<IBlockDetailsResponse> {
        return this.callApi<unknown, IBlockDetailsResponse>(`nova/block/metadata/${request.network}/${request.blockId}`, "get");
    }

    /**
     * Get the transaction included block.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionIncludedBlockDetails(request: ITransactionDetailsRequest): Promise<ITransactionDetailsResponse> {
        return this.callApi<unknown, ITransactionDetailsResponse>(`nova/transaction/${request.network}/${request.transactionId}`, "get");
    }

    /**
     * Get the transaction metadata.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionMetadata(request: ITransactionDetailsRequest): Promise<ITransactionMetadataResponse> {
        return this.callApi<unknown, ITransactionMetadataResponse>(
            `nova/transaction/metadata/${request.network}/${request.transactionId}`,
            "get",
        );
    }

    /**
     * Get the output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputDetails(request: IOutputDetailsRequest): Promise<IOutputDetailsResponse> {
        return this.callApi<unknown, IOutputDetailsResponse>(`nova/output/${request.network}/${request.outputId}`, "get");
    }

    /**
     * Get the account output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async accountDetails(request: IAccountDetailsRequest): Promise<IAccountDetailsResponse> {
        return this.callApi<unknown, IAccountDetailsResponse>(`nova/account/${request.network}/${request.accountId}`, "get");
    }

    /**
     * Get the nft output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async nftDetails(request: INftDetailsRequest): Promise<INftDetailsResponse> {
        return this.callApi<unknown, INftDetailsResponse>(`nova/nft/${request.network}/${request.nftId}`, "get");
    }

    /**
     * Get the anchor output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async anchorDetails(request: IAnchorDetailsRequest): Promise<IAnchorDetailsResponse> {
        return this.callApi<unknown, IAnchorDetailsResponse>(`nova/anchor/${request.network}/${request.anchorId}`, "get");
    }

    /**
     * Get the foundry output details.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async foundryDetails(request: IFoundryRequest): Promise<IFoundryResponse> {
        return this.callApi<unknown, IFoundryResponse>(`nova/foundry/${request.network}/${request.foundryId}`, "get");
    }

    /**
     * Get the foundries controlled by an account address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async accountFoundries(request: IFoundriesRequest): Promise<IFoundriesResponse> {
        return this.callApi<unknown, IFoundriesResponse>(`nova/account/foundries/${request.network}/${request.accountAddress}`, "get");
    }

    /**
     * Get the basic outputs details of an address.
     * @param request The Address Basic outputs request.
     * @returns The Address outputs response
     */
    public async basicOutputsDetails(request: IAddressDetailsRequest): Promise<IAddressDetailsResponse> {
        return this.callApi<unknown, IAddressDetailsResponse>(`nova/address/outputs/basic/${request.network}/${request.address}`, "get");
    }

    /**
     * Get the nft outputs details of an address.
     * @param request The Address outputs request.
     * @returns The Address outputs response
     */
    public async nftOutputsDetails(request: IAddressDetailsRequest): Promise<IAddressDetailsResponse> {
        return this.callApi<unknown, IAddressDetailsResponse>(`nova/address/outputs/nft/${request.network}/${request.address}`, "get");
    }

    /**
     * Get the anchor outputs details of an address.
     * @param request The Address Anchor outputs request.
     * @returns The Address outputs response
     */
    public async anchorOutputsDetails(request: IAddressDetailsRequest): Promise<IAddressDetailsResponse> {
        return this.callApi<unknown, IAddressDetailsResponse>(`nova/address/outputs/anchor/${request.network}/${request.address}`, "get");
    }

    /**
     * Get the delegation outputs details of an address.
     * @param request The Address Delegation outputs request.
     * @returns The Address outputs response
     */
    public async delegationOutputsDetails(request: IAddressDetailsRequest): Promise<IDelegationDetailsResponse> {
        return this.callApi<unknown, IDelegationDetailsResponse>(
            `nova/address/outputs/delegation/${request.network}/${request.address}`,
            "get",
        );
    }

    /**
     * Get the delegation outputs details of an address.
     * @param request The Address Delegation outputs request.
     * @returns The Address outputs response
     */
    public async delegationOutputsByValidator(request: IAddressDetailsRequest): Promise<IDelegationByValidatorResponse> {
        return this.callApi<unknown, IDelegationByValidatorResponse>(
            `nova/output/delegation/by-validator/${request.network}/${request.address}`,
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
            `nova/output/associated/${request.network}/${request.addressDetails.bech32}`,
            "post",
            { addressDetails: request.addressDetails },
        );
    }

    /**
     * Get the output ids by tag feature (basic or nft).
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputsByTag(request: ITaggedOutputsRequest): Promise<{ error?: string; outputs?: OutputsResponse }> {
        const params = FetchHelper.urlParams({ cursor: request.cursor });

        return this.callApi<unknown, { error?: string; outputs?: OutputsResponse }>(
            `nova/output/tagged/${request.network}/${request.tag}/${request.outputType}${params}`,
            "get",
        );
    }

    /**
     * Get the latest slot commitments.
     * @param network The network in context.
     * @returns The latest slot commitments response.
     */
    public async latestSlotCommitments(network: string): Promise<ILatestSlotCommitmentResponse> {
        return this.callApi<unknown, ILatestSlotCommitmentResponse>(`nova/commitment/latest/${network}`, "get");
    }

    /**
     * Get the account congestion.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getAccountCongestion(request: ICongestionRequest): Promise<ICongestionResponse> {
        return this.callApi<unknown, ICongestionResponse>(`nova/account/congestion/${request.network}/${request.accountId}`, "get");
    }

    /**
     * Get the account validator info.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getAccountValidatorDetails(request: IAccountValidatorDetailsRequest): Promise<IAccountValidatorDetailsResponse> {
        return this.callApi<unknown, ICongestionResponse>(`nova/account/validator/${request.network}/${request.accountId}`, "get");
    }

    /**
     * Get the output mana rewards.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getRewards(request: IRewardsRequest): Promise<IRewardsResponse> {
        const params = FetchHelper.urlParams({ slotIndex: request.slotIndex });
        return this.callApi<unknown, IRewardsResponse>(`nova/output/rewards/${request.network}/${request.outputId}${params}`, "get");
    }

    /**
     * Get the slot commitment.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getSlotCommitment(request: ISlotRequest): Promise<ISlotResponse> {
        return this.callApi<unknown, ISlotResponse>(`nova/slot/${request.network}/${request.slotIndex}`, "get");
    }

    /**
     * Get the slot blocks.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getSlotBlocks(request: ISlotBlocksRequest): Promise<ISlotBlocksResponse> {
        return this.callApi<unknown, ISlotBlocksResponse>(`nova/slot/blocks/chronicle/${request.network}/${request.slotIndex}`, "get");
    }

    /**
     * Get the epoch committee.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getEpochCommittee(request: IEpochCommitteeRequest): Promise<IEpochCommitteeResponse> {
        return this.callApi<unknown, IEpochCommitteeResponse>(`nova/epoch/committee/${request.network}/${request.epochIndex}`, "get");
    }

    /**
     * Get the slot analytics stats by slot index.
     * @param request The slot analytic stats get request.
     * @returns The slot stats response.
     */
    public async slotStats(request: ISlotAnalyticStatsRequest): Promise<ISlotAnalyticStatsResponse> {
        return this.callApi<unknown, ISlotAnalyticStatsResponse>(`nova/slot/stats/${request.network}/${request.slotIndex}`, "get");
    }

    /**
     * Get the epoch analytics stats by epoch index.
     * @param request The epoch analytic stats get request.
     * @returns The epoch stats response.
     */
    public async epochStats(request: IEpochAnalyticStatsRequest): Promise<IEpochAnalyticStats> {
        return this.callApi<unknown, IEpochAnalyticStats>(`nova/epoch/stats/${request.network}/${request.epochIndex}`, "get");
    }

    /**
     * Get the mana burned for slot.
     * @param request The mana burned request.
     * @returns The epoch stats response.
     */
    public async getManaBurnedForSlot(request: ISlotManaBurnedRequest): Promise<ISlotManaBurnedResponse> {
        return this.callApi<unknown, ISlotManaBurnedResponse>(`nova/slot/mana-burned/${request.network}/${request.slotIndex}`, "get");
    }

    /**
     * Get the current cached validators.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getValidators(request: INetworkBoundGetRequest): Promise<IValidatorsResponse> {
        return this.callApi<unknown, IValidatorsResponse>(`nova/validators/${request.network}`, "get");
    }

    /**
     * Get validator stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getValidatorStats(request: INetworkBoundGetRequest): Promise<IValidatorStatsResponse> {
        return this.callApi<unknown, IValidatorStatsResponse>(`nova/validators/stats/${request.network}`, "get");
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

    /**
     * Get the transaction history of an address (chronicle).
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionHistory(request: ITransactionHistoryRequest): Promise<ITransactionHistoryResponse> {
        const params = {
            pageSize: request.pageSize,
            sort: request.sort,
            startSlotIndex: request.startSlotIndex,
            cursor: request.cursor,
        };

        return this.callApi<unknown, ITransactionHistoryResponse>(
            `nova/transactionhistory/${request.network}/${request.address}${FetchHelper.urlParams(params)}`,
            "get",
        );
    }

    /**
     * Find items from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async search(request: ISearchRequest): Promise<ISearchResponse> {
        return this.callApi<unknown, ISearchResponse>(`nova/search/${request.network}/${request.query}`, "get");
    }

    /**
     * Get the influx analytics stats.
     * @param request The request to send.
     * @param request.network The network to fetch for.
     * @returns The response from the request.
     */
    public async influxAnalytics(request: { network: string }): Promise<IInfluxDailyResponse> {
        return this.callApi<unknown, IInfluxDailyResponse>(`nova/analytics/daily/${request.network}`, "get");
    }

    /**
     * Get the chronicle analytic stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async chronicleAnalytics(request: INetworkBoundGetRequest): Promise<IAnalyticStats> {
        return this.callApi<unknown, IAnalyticStats>(`nova/analytics/${request.network}`, "get");
    }
}
