import { InfluxDB } from "influx";
import cron from "node-cron";
import {
    ADDRESSES_WITH_BALANCE_DAILY_QUERY,
    ALIAS_ACTIVITY_DAILY_QUERY,
    TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY,
    BLOCK_DAILY_QUERY,
    LEDGER_SIZE_DAILY_QUERY,
    NFT_ACTIVITY_DAILY_QUERY,
    OUTPUTS_DAILY_QUERY,
    STORAGE_DEPOSIT_DAILY_QUERY,
    TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY,
    TOKENS_HELD_WITH_UC_DAILY_QUERY,
    TOKENS_TRANSFERRED_DAILY_QUERY,
    TRANSACTION_DAILY_QUERY,
    UNCLAIMED_GENESIS_OUTPUTS_DAILY_QUERY,
    UNCLAIMED_TOKENS_DAILY_QUERY,
    UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY,
    ADDRESSES_WITH_BALANCE_TOTAL_QUERY,
    NATIVE_TOKENS_STAT_TOTAL_QUERY,
    NFT_STAT_TOTAL_QUERY,
    SHIMMER_CLAIMED_TOTAL_QUERY,
    MILESTONE_STATS_QUERY,
    STORAGE_DEPOSIT_TOTAL_QUERY,
    MILESTONE_STATS_QUERY_BY_INDEX,
} from "./influxQueries";
import logger from "../../../logger";
import { IMilestoneAnalyticStats } from "../../../models/api/stats/IMilestoneAnalyticStats";
import { INetwork } from "../../../models/db/INetwork";
import { SHIMMER } from "../../../models/db/networkType";
import {
    IInfluxAnalyticsCache,
    IInfluxDailyCache,
    IInfluxMilestoneAnalyticsCache,
    initializeEmptyDailyCache,
} from "../../../models/influx/stardust/IInfluxDbCache";
import {
    IAddressesWithBalanceDailyInflux,
    IAliasActivityDailyInflux,
    IActiveAddressesDailyInflux,
    IBlocksDailyInflux,
    ILedgerSizeDailyInflux,
    INftActivityDailyInflux,
    IOutputsDailyInflux,
    IStorageDepositDailyInflux,
    ITokensHeldPerOutputDailyInflux,
    ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux,
    ITransactionsDailyInflux,
    IUnclaimedGenesisOutputsDailyInflux,
    IUnclaimedTokensDailyInflux,
    IUnlockConditionsPerTypeDailyInflux,
} from "../../../models/influx/stardust/IInfluxTimedEntries";
import { ITimedEntry } from "../../../models/influx/types";
import { InfluxDbClient } from "../../influx/influxClient";

type MilestoneUpdate = ITimedEntry & {
    milestoneIndex: number;
    taggedData: number;
    milestone: number;
    transaction: number;
    treasuryTransaction: number;
    noPayload: number;
};

/**
 * The collect graph data interval cron expression.
 * Every hour at 59 min 55 sec
 */
const COLLECT_GRAPHS_DATA_CRON = "55 59 * * * *";

/**
 * The collect analyitics data interval cron expression.
 * Every hour at 58 min 55 sec
 */
const COLLECT_ANALYTICS_DATA_CRON = "55 58 * * * *";

/**
 * The collect shimmer (un)claimed data interval cron expression.
 * Every 30 sec.
 */
const COLLECT_SHIMMER_DATA_CRON = "*/30 * * * * *";

/**
 * Milestone analyitics cache MAX size.
 */
const MILESTONE_CACHE_MAX = 20;

/**
 * The InfluxDb Client wrapper.
 */
export class InfluxServiceStardust extends InfluxDbClient {
    /**
     * The InfluxDb Client.
     */
    protected _client: InfluxDB;

    /**
     * The current influx graphs cache instance.
     */
    protected readonly _dailyCache: IInfluxDailyCache;

    /**
     * The current influx analytics cache instance.
     */
    protected readonly _analyticsCache: IInfluxAnalyticsCache;

    /**
     * The current influx milestone analytics cache instance.
     */
    protected readonly _milestoneCache: IInfluxMilestoneAnalyticsCache;

    /**
     * Create a new instance of InfluxDbClient.
     * @param network The network configuration.
     */
    constructor(network: INetwork) {
        super(network);
        this._dailyCache = initializeEmptyDailyCache();
        this._analyticsCache = {};
        this._milestoneCache = new Map();
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
        return this.mapToSortedValuesArray(this._dailyCache.aliasActivityDaily);
    }

    public get unlockConditionsPerTypeDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.unlockConditionsPerTypeDaily);
    }

    public get nftActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.nftActivityDaily);
    }

    public get tokensHeldWithUnlockConditionDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.tokensHeldWithUnlockConditionDaily);
    }

    public get unclaimedTokensDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.unclaimedTokensDaily);
    }

    public get unclaimedGenesisOutputsDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.unclaimedGenesisOutputsDaily);
    }

    public get ledgerSizeDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.ledgerSizeDaily);
    }

    public get storageDepositDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.storageDepositDaily);
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

    public async fetchAnalyticsForMilestone(milestoneIndex: number) {
        await this.collectMilestoneStatsByIndex(milestoneIndex);
        return this._milestoneCache.get(milestoneIndex);
    }

    public async fetchAnalyticsForMilestoneWithRetries(milestoneIndex: number): Promise<IMilestoneAnalyticStats | undefined> {
        const MAX_RETRY = 30;
        const RETRY_TIMEOUT = 350;

        let retries = 0;
        let maybeMsStats = this._milestoneCache.get(milestoneIndex);

        while (!maybeMsStats && retries < MAX_RETRY) {
            retries += 1;
            logger.debug(`[InfluxStardust] Try ${retries} of fetching milestone stats for ${milestoneIndex}`);
            maybeMsStats = this._milestoneCache.get(milestoneIndex);

            await new Promise((f) => setTimeout(f, RETRY_TIMEOUT));
        }

        return maybeMsStats;
    }

    /**
     * Setup a InfluxDb data collection periodic job.
     * Runs once at the start, then every COLLECT_DATA_FREQ_MS interval.
     */
    protected setupDataCollection() {
        const network = this._network.network;
        logger.verbose(`[InfluxStardust] Setting up data collection for (${network}).`);

        // eslint-disable-next-line no-void
        void this.collectGraphsDaily();
        // eslint-disable-next-line no-void
        void this.collectAnalytics();
        // eslint-disable-next-line no-void
        void this.collectMilestoneStats();
        if (this._network.network === SHIMMER) {
            // eslint-disable-next-line no-void
            void this.collectShimmerUnclaimed();
        }

        if (this._client) {
            cron.schedule(COLLECT_GRAPHS_DATA_CRON, async () => {
                // eslint-disable-next-line no-void
                void this.collectGraphsDaily();
            });

            cron.schedule(COLLECT_ANALYTICS_DATA_CRON, async () => {
                // eslint-disable-next-line no-void
                void this.collectAnalytics();
            });

            cron.schedule("*/4 * * * * *", async () => {
                // eslint-disable-next-line no-void
                void this.collectMilestoneStats();
            });

            if (this._network.network === SHIMMER) {
                cron.schedule(COLLECT_SHIMMER_DATA_CRON, async () => {
                    // eslint-disable-next-line no-void
                    void this.collectShimmerUnclaimed();
                });
            }
        } else {
            logger.debug(`[InfluxStardust] Client not configured for this network "${network}"`);
        }
    }

    /**
     * Performs the InfluxDb daily graph data collection.
     * Populates the dailyCache.
     */
    private async collectGraphsDaily() {
        logger.verbose(`[InfluxStardust] Collecting daily stats for "${this._network.network}"`);
        this.updateCacheEntry<IBlocksDailyInflux>(BLOCK_DAILY_QUERY, this._dailyCache.blocksDaily, "Blocks Daily");
        this.updateCacheEntry<ITransactionsDailyInflux>(TRANSACTION_DAILY_QUERY, this._dailyCache.transactionsDaily, "Transactions Daily");
        this.updateCacheEntry<IOutputsDailyInflux>(OUTPUTS_DAILY_QUERY, this._dailyCache.outputsDaily, "Outpus Daily");
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
        this.updateCacheEntry<IAliasActivityDailyInflux>(
            ALIAS_ACTIVITY_DAILY_QUERY,
            this._dailyCache.aliasActivityDaily,
            "Alias activity Daily",
        );
        this.updateCacheEntry<IUnlockConditionsPerTypeDailyInflux>(
            UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY,
            this._dailyCache.unlockConditionsPerTypeDaily,
            "Unlock conditions per type Daily",
        );
        this.updateCacheEntry<INftActivityDailyInflux>(NFT_ACTIVITY_DAILY_QUERY, this._dailyCache.nftActivityDaily, "Nft activity Daily");
        this.updateCacheEntry<ITokensHeldWithUnlockConditionDailyInflux>(
            TOKENS_HELD_WITH_UC_DAILY_QUERY,
            this._dailyCache.tokensHeldWithUnlockConditionDaily,
            "Tokens held with Unlock condition Daily",
        );
        this.updateCacheEntry<IUnclaimedTokensDailyInflux>(
            UNCLAIMED_TOKENS_DAILY_QUERY,
            this._dailyCache.unclaimedTokensDaily,
            "Unclaimed Tokens Daily",
        );
        this.updateCacheEntry<IUnclaimedGenesisOutputsDailyInflux>(
            UNCLAIMED_GENESIS_OUTPUTS_DAILY_QUERY,
            this._dailyCache.unclaimedGenesisOutputsDaily,
            "Unclaimed genesis outputs Daily",
        );
        this.updateCacheEntry<ILedgerSizeDailyInflux>(LEDGER_SIZE_DAILY_QUERY, this._dailyCache.ledgerSizeDaily, "Ledger size Daily");
        this.updateCacheEntry<IStorageDepositDailyInflux>(
            STORAGE_DEPOSIT_DAILY_QUERY,
            this._dailyCache.storageDepositDaily,
            "Storage Deposit Daily",
        );
    }

    /**
     * Performs the InfluxDb analytics data collection.
     * Populates the analyticsCache.
     */
    private async collectAnalytics() {
        logger.verbose(`[InfluxStardust] Collecting analytic stats for "${this._network.network}"`);
        try {
            for (const update of await this.queryInflux<ITimedEntry & { addressesWithBalance: string }>(
                ADDRESSES_WITH_BALANCE_TOTAL_QUERY,
                null,
                this.getToNanoDate(),
            )) {
                this._analyticsCache.addressesWithBalance = update.addressesWithBalance;
            }

            for (const update of await this.queryInflux<ITimedEntry & { nativeTokensCount: string }>(
                NATIVE_TOKENS_STAT_TOTAL_QUERY,
                null,
                this.getToNanoDate(),
            )) {
                this._analyticsCache.nativeTokensCount = update.nativeTokensCount;
            }

            for (const update of await this.queryInflux<ITimedEntry & { nftsCount: string }>(
                NFT_STAT_TOTAL_QUERY,
                null,
                this.getToNanoDate(),
            )) {
                this._analyticsCache.nftsCount = update.nftsCount;
            }

            for (const update of await this.queryInflux<ITimedEntry & { lockedStorageDeposit: string }>(
                STORAGE_DEPOSIT_TOTAL_QUERY,
                null,
                this.getToNanoDate(),
            )) {
                this._analyticsCache.lockedStorageDeposit = update.lockedStorageDeposit;
            }
        } catch (err) {
            logger.warn(`[InfluxStardust] Failed refreshing analytics for "${this._network.network}"! Cause: ${err}`);
        }
    }

    /**
     * Get the milestone analytics by index and set it in the cache.
     * @param milestoneIndex - The milestone index.
     */
    private async collectMilestoneStatsByIndex(milestoneIndex: number) {
        try {
            for (const update of await this._client.query<MilestoneUpdate>(MILESTONE_STATS_QUERY_BY_INDEX, {
                placeholders: { milestoneIndex },
            })) {
                this.updateMilestoneCache(update);
            }
        } catch (err) {
            logger.warn(`[InfluxStardust] Failed refreshing milestone stats for "${this._network.network}". Cause: ${err}`);
        }
    }

    private async collectShimmerUnclaimed() {
        logger.verbose(`[InfluxStardust] Collecting shimmer stats for "${this._network.network}"`);

        try {
            for (const update of await this.queryInflux<ITimedEntry & { totalUnclaimedShimmer: string }>(
                SHIMMER_CLAIMED_TOTAL_QUERY,
                null,
                this.getToNanoDate(),
            )) {
                this._analyticsCache.totalUnclaimedShimmer = update.totalUnclaimedShimmer;
            }
        } catch (err) {
            logger.warn(`[InfluxStardust] Failed refreshing shimmer stats for "${this._network.network}"! Cause: ${err}`);
        }
    }

    private async collectMilestoneStats() {
        logger.debug(`[InfluxStardust] Collecting milestone stats for "${this._network.network}"`);
        try {
            for (const update of await this.queryInflux<MilestoneUpdate>(MILESTONE_STATS_QUERY, null, this.getToNanoDate())) {
                this.updateMilestoneCache(update);
            }
        } catch (err) {
            logger.warn(`[InfluxStardust] Failed refreshing milestone stats for "${this._network.network}". Cause: ${err}`);
        }
    }

    private updateMilestoneCache(update: MilestoneUpdate) {
        if (update.milestoneIndex !== undefined && !this._milestoneCache.has(update.milestoneIndex)) {
            const { milestoneIndex, transaction, milestone, taggedData, treasuryTransaction, noPayload } = update;
            const blockCount = transaction + milestone + taggedData + treasuryTransaction + noPayload;
            this._milestoneCache.set(milestoneIndex, {
                milestoneIndex,
                blockCount,
                perPayloadType: {
                    transaction,
                    milestone,
                    taggedData,
                    treasuryTransaction,
                    noPayload,
                },
            });

            logger.debug(`[InfluxStardust] Added milestone index "${milestoneIndex}" to cache for "${this._network.network}"`);

            if (this._milestoneCache.size > MILESTONE_CACHE_MAX) {
                let lowestIndex: number;
                for (const index of this._milestoneCache.keys()) {
                    if (!lowestIndex) {
                        lowestIndex = index;
                    }

                    if (index < lowestIndex) {
                        lowestIndex = index;
                    }
                }

                logger.debug(`[InfluxStardust] Deleting milestone index "${lowestIndex}" ("${this._network.network}")`);

                this._milestoneCache.delete(lowestIndex);
            }
        }
    }
}
