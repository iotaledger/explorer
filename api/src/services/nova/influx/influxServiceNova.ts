import { ProtocolParametersResponse } from "@iota/sdk-nova";
import { InfluxDB, toNanoDate } from "influx";
import moment from "moment";
import cron from "node-cron";
import {
    BLOCK_DAILY_QUERY,
    OUTPUTS_DAILY_QUERY,
    ACCOUNT_ACTIVITY_DAILY_QUERY,
    ADDRESSES_WITH_BALANCE_DAILY_QUERY,
    ADDRESSES_WITH_BALANCE_TOTAL_QUERY,
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
    EPOCH_STATS_QUERY_BY_EPOCH_INDEX,
} from "./influxQueries";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";
import { IEpochAnalyticStats } from "../../../models/api/nova/stats/epoch/IEpochAnalyticStats";
import { INetwork } from "../../../models/db/INetwork";
import {
    IInfluxAnalyticsCache,
    IInfluxDailyCache,
    IInfluxEpochAnalyticsCache,
    initializeEmptyDailyCache,
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
import { epochIndexToUnixTimeRangeConverter, unixTimestampToEpochIndexConverter } from "../../../utils/nova/novaTimeUtils";
import { InfluxDbClient, NANOSECONDS_IN_MILLISECOND } from "../../influx/influxClient";
import { NodeInfoService } from "../nodeInfoService";

type EpochUpdate = ITimedEntry & {
    epochIndex: number;
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
 * The collect graph data interval cron expression.
 * Every hour at 59 min 55 sec
 */
const COLLECT_GRAPHS_DATA_CRON = "55 59 * * * *";

/**
 * The collect analyitics data interval cron expression.
 * Every hour at 58 min 55 sec
 */
const COLLECT_ANALYTICS_DATA_CRON = "55 58 * * * *";

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
     * The current influx analytics cache instance.
     */
    protected readonly _analyticsCache: IInfluxAnalyticsCache;

    /**
     * The network in context for this client.
     */
    protected readonly _network: INetwork;

    constructor(network: INetwork) {
        super(network);
        this._dailyCache = initializeEmptyDailyCache();
        this._epochCache = new Map();
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

    public async fetchAnalyticsForEpoch(epochIndex: number, protocolInfo: ProtocolParametersResponse) {
        await this.collectEpochStatsByIndex(epochIndex, protocolInfo);
        return this._epochCache.get(epochIndex);
    }

    public async fetchAnalyticsForEpochWithRetries(epochIndex: number): Promise<IEpochAnalyticStats | undefined> {
        const MAX_RETRY = 30;
        const RETRY_TIMEOUT = 350;

        let retries = 0;
        let maybeEpochStats = this._epochCache.get(epochIndex);

        while (!maybeEpochStats && retries < MAX_RETRY) {
            retries += 1;
            logger.debug(`[InfluxNova] Try ${retries} of fetching epoch stats for ${epochIndex}`);
            maybeEpochStats = this._epochCache.get(epochIndex);

            await new Promise((f) => setTimeout(f, RETRY_TIMEOUT));
        }

        return maybeEpochStats;
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
                void this.collectEpochStats();
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
            logger.warn(`[InfluxNova] Failed refreshing analytics for "${this._network.network}"! Cause: ${err}`);
        }
    }

    /**
     * Get the epoch analytics by index and set it in the cache.
     * @param epochIndex - The epoch index.
     * @param protocolInfo - The protocol information.
     */
    private async collectEpochStatsByIndex(epochIndex: number, protocolInfo: ProtocolParametersResponse) {
        try {
            const epochIndexToUnixTimeRange = epochIndexToUnixTimeRangeConverter(protocolInfo);
            const { from, to } = epochIndexToUnixTimeRange(epochIndex);
            const fromNano = toNanoDate((moment(Number(from) * 1000).valueOf() * NANOSECONDS_IN_MILLISECOND).toString());
            const toNano = toNanoDate((moment(Number(to) * 1000).valueOf() * NANOSECONDS_IN_MILLISECOND).toString());

            this.queryInflux<EpochUpdate>(EPOCH_STATS_QUERY_BY_EPOCH_INDEX, fromNano, toNano)
                .then((results) => {
                    for (const update of results) {
                        update.epochIndex = epochIndex;
                        this.updateEpochCache(update);
                    }
                })
                .catch((e) => {
                    logger.warn(
                        `[InfluxClient] Query ${EPOCH_STATS_QUERY_BY_EPOCH_INDEX} failed for (${this._network.network}). Cause ${e}`,
                    );
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
            const nodeService = ServiceFactory.get<NodeInfoService>(`node-info-${this._network.network}`);
            const nodeInfo = nodeService.getNodeInfo();
            const unixTimestampToEpochIndex = unixTimestampToEpochIndexConverter(nodeInfo.protocolParameters[0]);
            const epochIndex = unixTimestampToEpochIndex(moment().unix());
            // eslint-disable-next-line no-void
            void this.collectEpochStatsByIndex(epochIndex, nodeInfo.protocolParameters[0]);
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

                    if (epochIndex < lowestIndex) {
                        lowestIndex = index;
                    }
                }

                logger.debug(`[InfluxNova] Deleting epoch index "${lowestIndex}" ("${this._network.network}")`);

                this._epochCache.delete(lowestIndex);
            }
        }
    }
}
