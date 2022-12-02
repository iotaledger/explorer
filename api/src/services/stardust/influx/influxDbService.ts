import { ITimedEntry } from "../../../models/influx/IInfluxTimedEntries";
import { InfluxDbClient } from "./influxDbClient";

/**
 * Wrapper class around a InfluxDb client to access the cache data.
 */
export class InfluxDBService extends InfluxDbClient {
    public get blocksDaily() {
        return this.mapToSortedValuesArray(
            this._cache.blocksDaily
        );
    }

    public get transactionsDaily() {
        return this.mapToSortedValuesArray(
            this._cache.transactionsDaily
        );
    }

    public get outputsDaily() {
        return this.mapToSortedValuesArray(
            this._cache.outputsDaily
        );
    }

    public get tokensHeldDaily() {
        return this.mapToSortedValuesArray(
            this._cache.tokensHeldDaily
        );
    }

    public get addressesWithBalanceDaily() {
        return this.mapToSortedValuesArray(
            this._cache.addressesWithBalanceDaily
        );
    }

    public get avgAddressesPerMilestoneDaily() {
        return this.mapToSortedValuesArray(
            this._cache.avgAddressesPerMilestoneDaily
        );
    }

    public get tokensTransferredDaily() {
        return this.mapToSortedValuesArray(
            this._cache.tokensTransferredDaily
        );
    }

    public get aliasActivityDaily() {
        return this.mapToSortedValuesArray(
            this._cache.aliasActivityDaily
        );
    }

    public get unlockConditionsPerTypeDaily() {
        return this.mapToSortedValuesArray(
            this._cache.unlockConditionsPerTypeDaily
        );
    }

    public get nftActivityDaily() {
        return this.mapToSortedValuesArray(
            this._cache.nftActivityDaily
        );
    }

    public get tokensHeldWithUnlockConditionDaily() {
        return this.mapToSortedValuesArray(
            this._cache.tokensHeldWithUnlockConditionDaily
        );
    }

    public get unclaimedTokensDaily() {
        return this.mapToSortedValuesArray(
            this._cache.unclaimedTokensDaily
        );
    }

    public get unclaimedGenesisOutputsDaily() {
        return this.mapToSortedValuesArray(
            this._cache.unclaimedGenesisOutputsDaily
        );
    }

    public get ledgerSizeDaily() {
        return this.mapToSortedValuesArray(
            this._cache.ledgerSizeDaily
        );
    }

    public get storageDepositDaily() {
        return this.mapToSortedValuesArray(
            this._cache.storageDepositDaily
        );
    }

    private mapToSortedValuesArray<T extends ITimedEntry>(cacheEntry: Map<string, T>): T[] {
        return Array.from(
            cacheEntry.values()
        ).sort(this.ENTRIES_ASC_SORT);
    }
}

