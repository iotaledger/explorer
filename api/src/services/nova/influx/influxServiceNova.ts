import { InfluxDB, toNanoDate } from "influx";
import moment from "moment";
import cron from "node-cron";
import {
    BLOCK_DAILY_QUERY,
    OUTPUTS_DAILY_QUERY,
    ACCOUNT_ACTIVITY_DAILY_QUERY,
    ADDRESSES_WITH_BALANCE_DAILY_QUERY,
    ACCOUNT_ADDRESSES_WITH_BALANCE_TOTAL_QUERY,
    ANCHOR_ACTIVITY_DAILY_QUERY,
    BLOCK_ISSUERS_DAILY_QUERY,
    DELEGATIONS_ACTIVITY_DAILY_QUERY,
    DELEGATION_ACTIVITY_DAILY_QUERY,
    DELEGATORS_ACTIVITY_DAILY_QUERY,
    FOUNDRY_ACTIVITY_DAILY_QUERY,
    LEDGER_SIZE_DAILY_QUERY,
    MANA_BURN_DAILY_QUERY,
    NATIVE_TOKENS_STAT_TOTAL_QUERY,
    NFT_ACTIVITY_DAILY_QUERY,
    NFT_STAT_TOTAL_QUERY,
    STAKING_ACTIVITY_DAILY_QUERY,
    STORAGE_DEPOSIT_DAILY_QUERY,
    STORAGE_DEPOSIT_TOTAL_QUERY,
    TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY,
    TOKENS_HELD_WITH_UC_DAILY_QUERY,
    TOKENS_TRANSFERRED_DAILY_QUERY,
    TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY,
    TRANSACTION_DAILY_QUERY,
    UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY,
    VALIDATORS_ACTIVITY_DAILY_QUERY,
    DELEGATORS_TOTAL_QUERY,
    BLOCK_STATS_QUERY,
} from "./influxQueries";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";
import { INetwork } from "../../../models/db/INetwork";
import {
    IInfluxAnalyticsCache,
    IInfluxDailyCache,
    IInfluxEpochAnalyticsCache,
    IInfluxSlotAnalyticsCache,
    initializeEmptyDailyCache,
    ManaBurnedInSlot,
    ManaBurnedInSlotCache,
} from "../../../models/influx/nova/IInfluxDbCache";
import {
    IAccountActivityDailyInflux,
    IActiveAddressesDailyInflux,
    IAddressesWithBalanceDailyInflux,
    IAnchorActivityDailyInflux,
    IBlockIssuerDailyInflux,
    IBlocksDailyInflux,
    IDelegationActivityDailyInflux,
    IDelegationsActivityDailyInflux,
    IDelegatorsActivityDailyInflux,
    IFoundryActivityDailyInflux,
    ILedgerSizeDailyInflux,
    IManaBurnedDailyInflux,
    INftActivityDailyInflux,
    IOutputsDailyInflux,
    IStakingActivityDailyInflux,
    IStorageDepositDailyInflux,
    ITokensHeldPerOutputDailyInflux,
    ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux,
    ITransactionsDailyInflux,
    IUnlockConditionsPerTypeDailyInflux,
    IValidatorsActivityDailyInflux,
} from "../../../models/influx/nova/IInfluxTimedEntries";
import { ITimedEntry } from "../../../models/influx/types";
import { InfluxDbClient, NANOSECONDS_IN_MILLISECOND } from "../../influx/influxClient";
import { NovaTimeService } from "../novaTimeService";

type EpochUpdate = ITimedEntry & {
    epochIndex: number;
    taggedData: number;
    candidacy: number;
    transaction: number;
    noPayload: number;
};

type SlotUpdate = ITimedEntry & {
    slotIndex: number;
    taggedData: number;
    candidacy: number;
    transaction: number;
    noPayload: number;
};

/**
 * Epoch analyitics cache MAX size.
 */
const EPOCH_CACHE_MAX = 20;

/**
 * Slot analyitics cache MAX size.
 */
const SLOT_CACHE_MAX = 200;

/*
 * Epoch analyitics cache MAX size.
 */
const MANA_BURNED_CACHE_MAX = 20;

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

/*
 * The collect analytics data interval cron expression.
 * Every 10 minutes
 */
const COLLECT_EPOCH_ANALYTICS_DATA_CRON = "*/10 * * * *";

/**
 * The collect slot analytics data interval cron expression.
 * Every 10 seconds
 */
const COLLECT_SLOT_ANALYTICS_DATA_CRON = "*/10 * * * * *";

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
     * The current influx epoch analytics cache instance.
     */
    protected readonly _epochCache: IInfluxEpochAnalyticsCache;

    /**
     * The current influx slot analytics cache instance.
     */
    protected readonly _slotCache: IInfluxSlotAnalyticsCache;

    /**
     * The current influx analytics cache instance.
     */
    protected readonly _analyticsCache: IInfluxAnalyticsCache;

    /**
     * The current influx mana burned in slot cache.
     */
    protected readonly _manaBurnedInSlotCache: ManaBurnedInSlotCache;

    /**
     * The network in context for this client.
     */
    protected readonly _network: INetwork;

    /**
     * Nova time service for conversions.
     */
    private readonly _novatimeService: NovaTimeService;

    constructor(network: INetwork) {
        super(network);
        this._novatimeService = ServiceFactory.get<NovaTimeService>(`nova-time-${network.network}`);
        this._dailyCache = initializeEmptyDailyCache();
        this._epochCache = new Map();
        this._slotCache = new Map();
        this._manaBurnedInSlotCache = new Map();
        this._analyticsCache = {};
    }

    public get blocksDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.blocksDaily);
    }

    public get blockIssuersDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.blockIssuersDaily);
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

    public get anchorActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.anchorActivityDaily);
    }

    public get nftActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.nftActivityDaily);
    }

    public get accountActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.accountActivityDaily);
    }

    public get foundryActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.foundryActivityDaily);
    }

    public get delegationActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.delegationActivityDaily);
    }

    public get validatorsActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.validatorsActivityDaily);
    }

    public get delegatorsActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.delegatorsActivityDaily);
    }

    public get delegationsActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.delegationsActivityDaily);
    }

    public get stakingActivityDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.stakingActivityDaily);
    }

    public get unlockConditionsPerTypeDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.unlockConditionsPerTypeDaily);
    }

    public get tokensHeldWithUnlockConditionDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.tokensHeldWithUnlockConditionDaily);
    }

    public get ledgerSizeDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.ledgerSizeDaily);
    }

    public get storageDepositDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.storageDepositDaily);
    }

    public get manaBurnedDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.manaBurnedDaily);
    }

    public get accountAddressesWithBalance() {
        return this._analyticsCache.accountAddressesWithBalance;
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

    public get delegatorsCount() {
        return this._analyticsCache.delegatorsCount;
    }

    public async getEpochAnalyticStats(epochIndex: number) {
        if (!this._epochCache.get(epochIndex)) {
            await this.collectEpochStatsByIndex(epochIndex);
        }

        return this._epochCache.get(epochIndex);
    }

    public async getSlotAnalyticStats(slotIndex: number) {
        if (!this._slotCache.get(slotIndex)) {
            await this.collectSlotStatsByIndex(slotIndex);
        }

        return this._slotCache.get(slotIndex);
    }

    /**
     * Get the manaBurned stats by slot index.
     * @param slotIndex - The slot index.
     */
    public async getManaBurnedBySlotIndex(slotIndex: number): Promise<ManaBurnedInSlot | null> {
        if (this._manaBurnedInSlotCache.has(slotIndex)) {
            return this._manaBurnedInSlotCache.get(slotIndex);
        }

        const { from, to } = this._novatimeService.getSlotIndexToUnixTimeRange(slotIndex);
        const fromNano = toNanoDate((moment(Number(from) * 1000).valueOf() * NANOSECONDS_IN_MILLISECOND).toString());
        const toNano = toNanoDate((moment(Number(to) * 1000).valueOf() * NANOSECONDS_IN_MILLISECOND).toString());

        let manaBurnedResult: ManaBurnedInSlot | null = null;

        await this.queryInflux<ManaBurnedInSlot>(MANA_BURN_DAILY_QUERY.partial, fromNano, toNano)
            .then((results) => {
                for (const update of results) {
                    if (update.manaBurned !== undefined) {
                        update.slotIndex = slotIndex;
                        this.updateBurnedManaCache(update);

                        manaBurnedResult = update;
                    }
                }
            })
            .catch((e) => {
                logger.warn(`[InfluxClient] Query 'mana burned in slot' failed for (${this._network.network}). Cause ${e}`);
            });

        return manaBurnedResult;
    }

    protected setupDataCollection() {
        const network = this._network.network;
        logger.verbose(`[InfluxNova] Setting up data collection for (${network}).`);

        // eslint-disable-next-line no-void
        void this.collectGraphsDaily();
        // eslint-disable-next-line no-void
        void this.collectAnalytics();
        // eslint-disable-next-line no-void
        void this.collectEpochStats();
        // eslint-disable-next-line no-void
        void this.collectSlotStats();

        if (this._client) {
            cron.schedule(COLLECT_GRAPHS_DATA_CRON, async () => {
                // eslint-disable-next-line no-void
                void this.collectGraphsDaily();
            });

            cron.schedule(COLLECT_ANALYTICS_DATA_CRON, async () => {
                // eslint-disable-next-line no-void
                void this.collectAnalytics();
            });

            cron.schedule(COLLECT_EPOCH_ANALYTICS_DATA_CRON, async () => {
                // eslint-disable-next-line no-void
                void this.collectEpochStats();
            });

            cron.schedule(COLLECT_SLOT_ANALYTICS_DATA_CRON, async () => {
                // eslint-disable-next-line no-void
                void this.collectSlotStats();
            });
        }
    }

    /**
     * Performs the InfluxDb daily graph data collection.
     * Populates the dailyCache.
     */
    private async collectGraphsDaily() {
        logger.verbose(`[InfluxNova] Collecting daily stats for "${this._network.network}"`);
        this.updateCacheEntry<IBlocksDailyInflux>(BLOCK_DAILY_QUERY, this._dailyCache.blocksDaily, "Blocks Daily");
        this.updateCacheEntry<IBlockIssuerDailyInflux>(
            BLOCK_ISSUERS_DAILY_QUERY,
            this._dailyCache.blockIssuersDaily,
            "Block Issuers Daily",
        );
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
        this.updateCacheEntry<INftActivityDailyInflux>(NFT_ACTIVITY_DAILY_QUERY, this._dailyCache.nftActivityDaily, "Nft activity Daily");
        this.updateCacheEntry<IAccountActivityDailyInflux>(
            ACCOUNT_ACTIVITY_DAILY_QUERY,
            this._dailyCache.accountActivityDaily,
            "Account activity Daily",
        );
        this.updateCacheEntry<IFoundryActivityDailyInflux>(
            FOUNDRY_ACTIVITY_DAILY_QUERY,
            this._dailyCache.foundryActivityDaily,
            "Foundry activity Daily",
        );
        this.updateCacheEntry<IDelegationActivityDailyInflux>(
            DELEGATION_ACTIVITY_DAILY_QUERY,
            this._dailyCache.delegationActivityDaily,
            "Delegation activity Daily",
        );
        this.updateCacheEntry<IValidatorsActivityDailyInflux>(
            VALIDATORS_ACTIVITY_DAILY_QUERY,
            this._dailyCache.validatorsActivityDaily,
            "Validators activity Daily",
        );
        this.updateCacheEntry<IDelegatorsActivityDailyInflux>(
            DELEGATORS_ACTIVITY_DAILY_QUERY,
            this._dailyCache.delegatorsActivityDaily,
            "Delegators activity Daily",
        );
        this.updateCacheEntry<IDelegationsActivityDailyInflux>(
            DELEGATIONS_ACTIVITY_DAILY_QUERY,
            this._dailyCache.delegationsActivityDaily,
            "Delegations activity Daily",
        );
        this.updateCacheEntry<IStakingActivityDailyInflux>(
            STAKING_ACTIVITY_DAILY_QUERY,
            this._dailyCache.stakingActivityDaily,
            "Staking activity Daily",
        );
        this.updateCacheEntry<IUnlockConditionsPerTypeDailyInflux>(
            UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY,
            this._dailyCache.unlockConditionsPerTypeDaily,
            "Unlock conditions per type Daily",
        );
        this.updateCacheEntry<ITokensHeldWithUnlockConditionDailyInflux>(
            TOKENS_HELD_WITH_UC_DAILY_QUERY,
            this._dailyCache.tokensHeldWithUnlockConditionDaily,
            "Tokens held with Unlock condition Daily",
        );
        this.updateCacheEntry<ILedgerSizeDailyInflux>(LEDGER_SIZE_DAILY_QUERY, this._dailyCache.ledgerSizeDaily, "Ledger size Daily");
        this.updateCacheEntry<IStorageDepositDailyInflux>(
            STORAGE_DEPOSIT_DAILY_QUERY,
            this._dailyCache.storageDepositDaily,
            "Storage Deposit Daily",
        );
        this.updateCacheEntry<IManaBurnedDailyInflux>(MANA_BURN_DAILY_QUERY, this._dailyCache.manaBurnedDaily, "Mana Burned Daily");
    }

    /**
     * Performs the InfluxDb analytics data collection.
     * Populates the analyticsCache.
     */
    private async collectAnalytics() {
        logger.verbose(`[InfluxNova] Collecting analytic stats for "${this._network.network}"`);
        try {
            for (const update of await this.queryInflux<ITimedEntry & { accountAddressesWithBalance: string }>(
                ACCOUNT_ADDRESSES_WITH_BALANCE_TOTAL_QUERY,
                null,
                this.getToNanoDate(),
            )) {
                this._analyticsCache.accountAddressesWithBalance = update.accountAddressesWithBalance;
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

            for (const update of await this.queryInflux<ITimedEntry & { delegatorsCount: string }>(
                DELEGATORS_TOTAL_QUERY,
                null,
                this.getToNanoDate(),
            )) {
                this._analyticsCache.delegatorsCount = update.delegatorsCount;
            }
        } catch (err) {
            logger.warn(`[InfluxNova] Failed refreshing analytics for "${this._network.network}"! Cause: ${err}`);
        }
    }

    /**
     * Get the epoch analytics by index and set it in the cache.
     * @param epochIndex - The epoch index.
     */
    private async collectEpochStatsByIndex(epochIndex: number) {
        try {
            const { from, to } = this._novatimeService.getEpochIndexToUnixTimeRange(epochIndex);
            const fromNano = toNanoDate((moment(Number(from) * 1000).valueOf() * NANOSECONDS_IN_MILLISECOND).toString());
            const toNano = toNanoDate((moment(Number(to) * 1000).valueOf() * NANOSECONDS_IN_MILLISECOND).toString());

            await this.queryInflux<EpochUpdate>(BLOCK_STATS_QUERY, fromNano, toNano)
                .then((results) => {
                    for (const update of results) {
                        update.epochIndex = epochIndex;
                        this.updateEpochCache(update);
                    }
                })
                .catch((e) => {
                    logger.warn(`[InfluxClient] Query ${BLOCK_STATS_QUERY} failed for (${this._network.network}). Cause ${e}`);
                });
        } catch (err) {
            logger.warn(`[InfluxNova] Failed refreshing epoch stats for "${this._network.network}". Cause: ${err}`);
        }
    }

    /**
     * Get the epoch analytics and set it in the cache.
     */
    private async collectEpochStats() {
        try {
            logger.debug(`[InfluxNova] Collecting epoch stats for "${this._network.network}"`);
            const epochIndex = this._novatimeService.getUnixTimestampToEpochIndex(moment().unix());
            // eslint-disable-next-line no-void
            void this.collectEpochStatsByIndex(epochIndex);
        } catch (err) {
            logger.warn(`[InfluxNova] Failed refreshing epoch stats for "${this._network.network}". Cause: ${err}`);
        }
    }

    private updateEpochCache(update: EpochUpdate) {
        if (update.epochIndex !== undefined && !this._epochCache.has(update.epochIndex)) {
            const { epochIndex, transaction, candidacy, taggedData, noPayload } = update;
            const blockCount = transaction + candidacy + taggedData + noPayload;
            this._epochCache.set(epochIndex, {
                epochIndex,
                blockCount,
                perPayloadType: {
                    transaction,
                    candidacy,
                    taggedData,
                    noPayload,
                },
            });

            logger.debug(`[InfluxNova] Added epoch index "${epochIndex}" to cache for "${this._network.network}"`);

            if (this._epochCache.size > EPOCH_CACHE_MAX) {
                let lowestIndex: number;
                for (const index of this._epochCache.keys()) {
                    if (!lowestIndex) {
                        lowestIndex = index;
                    }

                    if (index < lowestIndex) {
                        lowestIndex = index;
                    }
                }

                logger.debug(`[InfluxNova] Deleting epoch index "${lowestIndex}" ("${this._network.network}")`);

                this._epochCache.delete(lowestIndex);
            }
        }
    }

    private updateBurnedManaCache(update: ManaBurnedInSlot) {
        if (update.slotIndex && !this._manaBurnedInSlotCache.has(update.slotIndex)) {
            const { slotIndex } = update;

            this._manaBurnedInSlotCache.set(slotIndex, update);

            logger.debug(`[InfluxNova] Added slot index "${slotIndex}" to ManaBurned cache for "${this._network.network}"`);

            if (this._manaBurnedInSlotCache.size > MANA_BURNED_CACHE_MAX) {
                let lowestIndex: number;
                for (const index of this._manaBurnedInSlotCache.keys()) {
                    if (!lowestIndex) {
                        lowestIndex = index;
                    }

                    if (index < lowestIndex) {
                        lowestIndex = index;
                    }
                }

                logger.debug(`[InfluxNova] Deleting epoch index "${lowestIndex}" ("${this._network.network}")`);

                this._manaBurnedInSlotCache.delete(lowestIndex);
            }
        }
    }

    /**
     * Get the slot analytics by index and set it in the cache.
     * @param slotIndex - The slot index.
     */
    private async collectSlotStatsByIndex(slotIndex: number) {
        try {
            const { from, to } = this._novatimeService.getSlotIndexToUnixTimeRange(slotIndex);
            const fromNano = toNanoDate((moment(Number(from) * 1000).valueOf() * NANOSECONDS_IN_MILLISECOND).toString());
            const toNano = toNanoDate((moment(Number(to) * 1000).valueOf() * NANOSECONDS_IN_MILLISECOND).toString());

            await this.queryInflux<SlotUpdate>(BLOCK_STATS_QUERY, fromNano, toNano)
                .then((results) => {
                    for (const update of results) {
                        update.slotIndex = slotIndex;
                        this.updateSlotCache(update);
                    }
                })
                .catch((e) => {
                    logger.warn(`[InfluxClient] Query ${BLOCK_STATS_QUERY} failed for (${this._network.network}). Cause ${e}`);
                });
        } catch (err) {
            logger.warn(`[InfluxNova] Failed refreshing slot stats for "${this._network.network}". Cause: ${err}`);
        }
    }

    /**
     * Get the slot analytics and set it in the cache.
     */
    private async collectSlotStats() {
        try {
            logger.debug(`[InfluxNova] Collecting slot stats for "${this._network.network}"`);
            const slotIndex = this._novatimeService.getUnixTimestampToSlotIndex(moment().unix());
            // eslint-disable-next-line no-void
            void this.collectSlotStatsByIndex(slotIndex);
        } catch (err) {
            logger.warn(`[InfluxNova] Failed refreshing slot stats for "${this._network.network}". Cause: ${err}`);
        }
    }

    private updateSlotCache(update: SlotUpdate) {
        if (update.slotIndex !== undefined && !this._slotCache.has(update.slotIndex)) {
            const { slotIndex, transaction, candidacy, taggedData, noPayload } = update;
            const blockCount = transaction + candidacy + taggedData + noPayload;
            this._slotCache.set(slotIndex, {
                slotIndex,
                blockCount,
                perPayloadType: {
                    transaction,
                    candidacy,
                    taggedData,
                    noPayload,
                },
            });

            logger.debug(`[InfluxNova] Added slot index "${slotIndex}" to cache for "${this._network.network}"`);

            if (this._slotCache.size > SLOT_CACHE_MAX) {
                let lowestIndex: number;
                for (const index of this._slotCache.keys()) {
                    if (!lowestIndex) {
                        lowestIndex = index;
                    }

                    if (slotIndex < lowestIndex) {
                        lowestIndex = index;
                    }
                }

                logger.debug(`[InfluxNova] Deleting slot index "${lowestIndex}" ("${this._network.network}")`);

                this._slotCache.delete(lowestIndex);
            }
        }
    }
}
