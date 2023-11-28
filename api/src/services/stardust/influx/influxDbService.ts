import { InfluxDbClient } from "./influxDbClient";
import logger from "../../../logger";
import { IMilestoneAnalyticStats } from "../../../models/api/stats/IMilestoneAnalyticStats";
import { ITimedEntry } from "../../../models/influx/IInfluxTimedEntries";

/**
 * Wrapper class around a InfluxDb client to access the cache data.
 */
export class InfluxDBService extends InfluxDbClient {
    public get blocksDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.blocksDaily
        );
    }

    public get transactionsDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.transactionsDaily
        );
    }

    public get outputsDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.outputsDaily
        );
    }

    public get tokensHeldDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.tokensHeldDaily
        );
    }

    public get addressesWithBalanceDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.addressesWithBalanceDaily
        );
    }

    public get activeAddressesDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.activeAddressesDaily
        );
    }

    public get tokensTransferredDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.tokensTransferredDaily
        );
    }

    public get aliasActivityDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.aliasActivityDaily
        );
    }

    public get unlockConditionsPerTypeDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.unlockConditionsPerTypeDaily
        );
    }

    public get nftActivityDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.nftActivityDaily
        );
    }

    public get tokensHeldWithUnlockConditionDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.tokensHeldWithUnlockConditionDaily
        );
    }

    public get unclaimedTokensDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.unclaimedTokensDaily
        );
    }

    public get unclaimedGenesisOutputsDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.unclaimedGenesisOutputsDaily
        );
    }

    public get ledgerSizeDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.ledgerSizeDaily
        );
    }

    public get storageDepositDaily() {
        return this.mapToSortedValuesArray(
            this._dailyCache.storageDepositDaily
        );
    }

    public get addressesWithBalance() {
        return this._analyticsCache.addressesWithBalance;
    }

    public get nativeTokensCount() {
        return this._analyticsCache.nativeTokensCount;
    }

    public get nftsCount() {
        return this._analyticsCache.nftsCount;
    }

    public get lockedStorageDeposit() {
        return this._analyticsCache.lockedStorageDeposit;
    }

    public get totalUnclaimedShimmer() {
        return this._analyticsCache.totalUnclaimedShimmer;
    }

    public get milestoneAnalytics() {
        return this._milestoneCache;
    }

    public async fetchAnalyticsForMilestoneWithRetries(
        milestoneIndex: number
    ): Promise<IMilestoneAnalyticStats | undefined> {
        const MAX_RETRY = 30;
        const RETRY_TIMEOUT = 350;

        let retries = 0;
        let maybeMsStats = this._milestoneCache.get(milestoneIndex);

        while (!maybeMsStats && retries < MAX_RETRY) {
            retries += 1;
            logger.debug(`[InfluxDbService] Try ${retries} of fetching milestone stats for ${milestoneIndex}`);
            maybeMsStats = this._milestoneCache.get(milestoneIndex);

            await new Promise(f => setTimeout(f, RETRY_TIMEOUT));
        }

        return maybeMsStats;
    }

    private mapToSortedValuesArray<T extends ITimedEntry>(cacheEntry: Map<string, T>): T[] {
        return Array.from(
            cacheEntry.values()
        ).sort(this.ENTRIES_ASC_SORT);
    }
}

