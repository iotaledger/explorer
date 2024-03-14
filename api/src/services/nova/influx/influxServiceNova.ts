import { InfluxDB } from "influx";
import cron from "node-cron";
import {
    ACCOUNT_ACTIVITY_DAILY_QUERY,
    ADDRESSES_WITH_BALANCE_DAILY_QUERY,
    ADDRESSES_WITH_BALANCE_TOTAL_QUERY,
    ANCHOR_ACTIVITY_DAILY_QUERY,
    BLOCK_DAILY_QUERY,
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
    OUTPUTS_DAILY_QUERY,
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
} from "./influxQueries";
import logger from "../../../logger";
import { INetwork } from "../../../models/db/INetwork";
import { IInfluxAnalyticsCache, IInfluxDailyCache, initializeEmptyDailyCache } from "../../../models/influx/nova/IInfluxDbCache";
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
import { InfluxDbClient } from "../../influx/influxClient";

/**
 * The collect graph data interval cron expression.
 * Every hour at 59 min 55 sec
 */
const COLLECT_GRAPHS_DATA_CRON = "55 59 * * * *";

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

    protected setupDataCollection() {
        const network = this._network.network;
        logger.verbose(`[InfluxNova] Setting up data collection for (${network}).`);

        // eslint-disable-next-line no-void
        void this.collectGraphsDaily();
        // eslint-disable-next-line no-void
        void this.collectAnalytics();

        if (this._client) {
            cron.schedule(COLLECT_GRAPHS_DATA_CRON, async () => {
                // eslint-disable-next-line no-void
                void this.collectGraphsDaily();
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
}
