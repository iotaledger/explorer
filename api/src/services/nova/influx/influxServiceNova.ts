import { InfluxDB } from "influx";
import {
    ADDRESSES_WITH_BALANCE_DAILY_QUERY,
    ANCHOR_ACTIVITY_DAILY_QUERY,
    BLOCK_DAILY_QUERY,
    OUTPUTS_DAILY_QUERY,
    TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY,
    TOKENS_TRANSFERRED_DAILY_QUERY,
    TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY,
    TRANSACTION_DAILY_QUERY,
} from "./influxQueries";
import logger from "../../../logger";
import { INetwork } from "../../../models/db/INetwork";
import { IInfluxDailyCache, initializeEmptyDailyCache } from "../../../models/influx/nova/IInfluxDbCache";
import {
    IActiveAddressesDailyInflux,
    IAddressesWithBalanceDailyInflux,
    IAnchorActivityDailyInflux,
    IBlocksDailyInflux,
    IOutputsDailyInflux,
    ITokensHeldPerOutputDailyInflux,
    ITokensTransferredDailyInflux,
    ITransactionsDailyInflux,
} from "../../../models/influx/nova/IInfluxTimedEntries";
import { InfluxDbClient } from "../../influx/influxClient";

export class InfluxServiceNova extends InfluxDbClient {
    /**
     * The InfluxDb Client.
     */
    protected _client: InfluxDB;

    /**
     * The current influx graphs cache instance.
     */
    protected readonly _dailyCache: IInfluxDailyCache;

    /**
     * The network in context for this client.
     */
    protected readonly _network: INetwork;

    constructor(network: INetwork) {
        super(network);
        this._dailyCache = initializeEmptyDailyCache();
    }

    public get blocksDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.blocksDaily);
    }

    public get transactionsDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.transactionsDaily);
    }

    public get outputsDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.outputsDaily);
    }

    public get tokensHeldDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.tokensHeldDaily);
    }

    public get addressesWithBalanceDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.addressesWithBalanceDaily);
    }

    public get activeAddressesDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.activeAddressesDaily);
    }

    public get tokensTransferredDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.tokensTransferredDaily);
    }

    public get aliasActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.anchorActivityDaily);
    }

    protected setupDataCollection() {
        const network = this._network.network;
        logger.verbose(`[InfluxNova] Setting up data collection for (${network}).`);

        // eslint-disable-next-line no-void
        void this.collectGraphsDaily();
    }

    /**
     * Performs the InfluxDb daily graph data collection.
     * Populates the dailyCache.
     */
    private async collectGraphsDaily() {
        logger.verbose(`[InfluxNova] Collecting daily stats for "${this._network.network}"`);
        this.updateCacheEntry<IBlocksDailyInflux>(BLOCK_DAILY_QUERY, this._dailyCache.blocksDaily, "Blocks Daily", true);
        this.updateCacheEntry<ITransactionsDailyInflux>(TRANSACTION_DAILY_QUERY, this._dailyCache.transactionsDaily, "Transactions Daily");
        this.updateCacheEntry<IOutputsDailyInflux>(OUTPUTS_DAILY_QUERY, this._dailyCache.outputsDaily, "Outputs Daily");
        this.updateCacheEntry<ITokensHeldPerOutputDailyInflux>(
            TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY,
            this._dailyCache.tokensHeldDaily,
            "Tokens Held Daily",
        );
        this.updateCacheEntry<IAddressesWithBalanceDailyInflux>(
            ADDRESSES_WITH_BALANCE_DAILY_QUERY,
            this._dailyCache.addressesWithBalanceDaily,
            "Addresses with balance Daily",
        );
        this.updateCacheEntry<IActiveAddressesDailyInflux>(
            TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY,
            this._dailyCache.activeAddressesDaily,
            "Number of Daily Active Addresses",
        );
        this.updateCacheEntry<ITokensTransferredDailyInflux>(
            TOKENS_TRANSFERRED_DAILY_QUERY,
            this._dailyCache.tokensTransferredDaily,
            "Tokens transferred Daily",
        );
        this.updateCacheEntry<IAnchorActivityDailyInflux>(
            ANCHOR_ACTIVITY_DAILY_QUERY,
            this._dailyCache.anchorActivityDaily,
            "Anchor activity Daily",
        );
    }
}
