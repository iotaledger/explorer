import { NetworkConfigurationError } from "../../errors/networkConfigurationError";
import { IAddressBalanceResponse } from "../../models/api/stardust/IAddressBalanceResponse";
import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { IAnalyticStats, ICountAndValueStats, IAddressesStats } from "../../models/api/stats/IAnalyticStats";
import { IMilestoneAnalyticStats } from "../../models/api/stats/IMilestoneAnalyticStats";
import { IShimmerClaimed } from "../../models/api/stats/IShimmerClaimed";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../../utils/fetchHelper";

const CHRONICLE_ENDPOINTS = {
    updatedByAddress: "/api/explorer/v2/ledger/updates/by-address/",
    balance: "/api/explorer/v2/balance/",
    nativeTokensStats: "/api/analytics/v2/ledger/native-tokens",
    nftStats: "/api/analytics/v2/ledger/nfts",
    addresses: "/api/analytics/v2/activity/addresses",
    lockedStorageDeposit: "/api/analytics/v2/ledger/native-tokens",
    milestones: "/api/analytics/v2/activity/milestones/",
    shimmerClaiming: "/api/analytics/v2/activity/claimed-tokens"
};

export class ChronicleService {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * The permanode JWT.
     */
    private readonly _jwt?: string;

    constructor(config: INetwork) {
        this._endpoint = config.permaNodeEndpoint;
        this._jwt = config.permaNodeJwt;
    }

    /**
     * Get the current address balance info.
     * @param address The address to fetch the balance for.
     * @returns The address balance response.
     */
    public async addressBalance(
        address: string
    ): Promise<IAddressBalanceResponse | undefined> {
        try {
            return await FetchHelper.json<never, IAddressBalanceResponse>(
                this._endpoint,
                `${CHRONICLE_ENDPOINTS.balance}${address}`,
                "get"
            );
        } catch (error) {
            return { error };
        }
    }

    /**
     * Get the current milestone stats by milestoneId
     * @param milestoneId The milestone id.
     * @returns The milestone stats.
     */
    public async milestoneAnalytics(
        milestoneId: string
    ): Promise<IMilestoneAnalyticStats | undefined> {
        try {
            return await this.fetchHelperTryGet<IMilestoneAnalyticStats>(
                `${CHRONICLE_ENDPOINTS.milestones}${milestoneId}`,
                {}
            );
        } catch (error) {
            return { error };
        }
    }

    /**
     * Fetch the analytic stats.
     * @param currentMilestoneIndex The latest milestone index.
     * @param firstMilestoneOfYesterday The first milestone at beginning of previous day.
     * @param lastMilestoneOfYesterday The last milestone at end of previous day.
     * @returns The analytic stats.
     */
    public async analytics(
        currentMilestoneIndex: number,
        firstMilestoneOfYesterday: number,
        lastMilestoneOfYesterday: number
    ): Promise<IAnalyticStats> | undefined {
        let dailyAddresses: IAddressesStats;

        const nativeTokens = await this.fetchHelperTryGet<ICountAndValueStats>(
            CHRONICLE_ENDPOINTS.nativeTokensStats,
            { ledgerIndex: currentMilestoneIndex }
        );

        const nfts = await this.fetchHelperTryGet<ICountAndValueStats>(
            CHRONICLE_ENDPOINTS.nftStats,
            { ledgerIndex: currentMilestoneIndex }
        );

        const totalAddresses = await this.fetchHelperTryGet<IAddressesStats>(
            CHRONICLE_ENDPOINTS.addresses,
            { endIndex: currentMilestoneIndex }
        );

        const lockedStorageDeposit = await this.fetchHelperTryGet<ICountAndValueStats>(
            CHRONICLE_ENDPOINTS.lockedStorageDeposit,
            { ledgerIndex: currentMilestoneIndex }
        );

        if (firstMilestoneOfYesterday && lastMilestoneOfYesterday) {
            dailyAddresses = await this.fetchHelperTryGet<IAddressesStats>(
                CHRONICLE_ENDPOINTS.addresses,
                { startIndex: firstMilestoneOfYesterday, endIndex: lastMilestoneOfYesterday }
            );
        }

        return {
            nativeTokens,
            nfts,
            totalAddresses,
            dailyAddresses,
            lockedStorageDeposit
        };
    }

    /**
     * Get the transaction history of an address.
     * @param request The ITransactionHistoryRequest.
     * @returns The history reponse.
     */
    public async transactionHistory(
        request: ITransactionHistoryRequest
    ): Promise<ITransactionHistoryResponse | undefined> {
        try {
            const params = {
                pageSize: request.pageSize,
                sort: request.sort,
                startMilestoneIndex: request.startMilestoneIndex,
                cursor: request.cursor
            };

            return await FetchHelper.json<never, ITransactionHistoryResponse>(
                this._endpoint,
                `${CHRONICLE_ENDPOINTS.updatedByAddress}${request.address}${params ?
                    `${FetchHelper.urlParams(params)}` :
                    ""}`,
                "get"
            );
        } catch (error) {
            return { error };
        }
    }

    /**
     * Get the shimmer claiming statistics.
     * @returns The claiming statistics.
     */
    public async fetchShimmerClaimedCount(): Promise<IShimmerClaimed> {
        const claimingStats = this.fetchHelperTryGet<IShimmerClaimed>(
            CHRONICLE_ENDPOINTS.shimmerClaiming, {}
        );
        return claimingStats;
    }

    private async fetchHelperTryGet<R>(path: string, params: Record<string, unknown>): Promise<R> {
        let response: R | undefined;

        if (!this._jwt) {
            throw new NetworkConfigurationError(`Chronicle JWT not configured for ${this._endpoint}...`);
        }

        try {
            response = await FetchHelper.json<unknown, R>(
                this._endpoint,
                `${path}${FetchHelper.urlParams(params)}`,
                "get",
                null,
                { "Authorization": `Bearer ${this._jwt}` }
            );
        } catch (err) {
            console.log("Failed fetching analytics stats on", path, "with params", params, "reason", err);
        }

        return response;
    }
}

