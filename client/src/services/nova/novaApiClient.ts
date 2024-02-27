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
import { ISlotRequest } from "~/models/api/nova/ISlotRequest";
import { ISlotResponse } from "~/models/api/nova/ISlotResponse";
import { ITransactionDetailsRequest } from "~/models/api/nova/ITransactionDetailsRequest";
import { ITransactionDetailsResponse } from "~/models/api/nova/ITransactionDetailsResponse";
import { ICongestionRequest } from "~/models/api/nova/ICongestionRequest";
import { ICongestionResponse } from "~/models/api/nova/ICongestionResponse";
import { ILatestSlotCommitmentResponse } from "~/models/api/nova/ILatestSlotCommitmentsResponse";

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
     * Get the output mana rewards.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getRewards(request: IRewardsRequest): Promise<IRewardsResponse> {
        return this.callApi<unknown, IRewardsResponse>(`nova/output/rewards/${request.network}/${request.outputId}`, "get");
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
    public async getSlotBlocks(request: ISlotRequest): Promise<IBlockResponse> {
        return this.callApi<unknown, IBlockResponse>(`nova/slot/blocks/chronicle/${request.network}/${request.slotIndex}`, "get");
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
     * Find items from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async search(request: ISearchRequest): Promise<ISearchResponse> {
        return this.callApi<unknown, ISearchResponse>(`nova/search/${request.network}/${request.query}`, "get");
    }
}
