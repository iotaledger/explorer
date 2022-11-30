import { InfluxDbClient } from "./influxDbClient";

/**
 * Wrapper class around a InfluxDb client to access the cache data.
 */
export class InfluxDBService extends InfluxDbClient {
    public get blocksDaily() {
        return this._cache.blocksDaily;
    }

    public get transactionsDaily() {
        return this._cache.transactionsDaily;
    }

    public get outputsDaily() {
        return this._cache.outputsDaily;
    }

    public get tokensHeldDaily() {
        return this._cache.tokensHeldDaily;
    }

    public get addressesWithBalanceDaily() {
        return this._cache.addressesWithBalanceDaily;
    }

    public get avgAddressesPerMilestoneDaily() {
        return this._cache.avgAddressesPerMilestoneDaily;
    }

    public get tokensTransferredDaily() {
        return this._cache.tokensTransferredDaily;
    }

    public get aliasActivityDaily() {
        return this._cache.aliasActivityDaily;
    }

    public get unlockConditionsPerTypeDaily() {
        return this._cache.unlockConditionsPerTypeDaily;
    }

    public get nftActivityDaily() {
        return this._cache.nftActivityDaily;
    }

    public get tokensHeldWithUnlockConditionDaily() {
        return this._cache.tokensHeldWithUnlockConditionDaily;
    }

    public get unclaimedTokensDaily() {
        return this._cache.unclaimedTokensDaily;
    }

    public get unclaimedGenesisOutputsDaily() {
        return this._cache.unclaimedGenesisOutputsDaily;
    }

    public get ledgerSizeDaily() {
        return this._cache.ledgerSizeDaily;
    }

    public get storageDepositDaily() {
        return this._cache.storageDepositDaily;
    }
}

