import { INanoDate, InfluxDB, IPingStats, IResults, toNanoDate } from "influx";
import moment from "moment";
import cron from "node-cron";
import { INetwork } from "../../../models/db/INetwork";
import { SHIMMER } from "../../../models/db/networkType";
import {
    DayKey, DAY_KEY_FORMAT, IInfluxAnalyticsCache, IInfluxDailyCache,
    IInfluxMilestoneAnalyticsCache, initializeEmptyDailyCache
} from "../../../models/influx/IInfluxDbCache";
import {
    IAddressesWithBalanceDailyInflux, IAliasActivityDailyInflux, IActiveAddressesDailyInflux,
    IBlocksDailyInflux, ILedgerSizeDailyInflux, INftActivityDailyInflux, IOutputsDailyInflux,
    IStorageDepositDailyInflux, ITimedEntry, ITokensHeldPerOutputDailyInflux,
    ITokensHeldWithUnlockConditionDailyInflux, ITokensTransferredDailyInflux, ITransactionsDailyInflux,
    IUnclaimedGenesisOutputsDailyInflux, IUnclaimedTokensDailyInflux, IUnlockConditionsPerTypeDailyInflux
} from "../../../models/influx/IInfluxTimedEntries";
import {
    ADDRESSES_WITH_BALANCE_DAILY_QUERY, ALIAS_ACTIVITY_DAILY_QUERY,
    TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY, BLOCK_DAILY_QUERY,
    LEDGER_SIZE_DAILY_QUERY, NFT_ACTIVITY_DAILY_QUERY, OUTPUTS_DAILY_QUERY,
    STORAGE_DEPOSIT_DAILY_QUERY,
    TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY, TOKENS_HELD_WITH_UC_DAILY_QUERY,
    TOKENS_TRANSFERRED_DAILY_QUERY, TRANSACTION_DAILY_QUERY,
    UNCLAIMED_GENESIS_OUTPUTS_DAILY_QUERY, UNCLAIMED_TOKENS_DAILY_QUERY,
    UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY,
    ADDRESSES_WITH_BALANCE_TOTAL_QUERY,
    NATIVE_TOKENS_STAT_TOTAL_QUERY,
    NFT_STAT_TOTAL_QUERY,
    SHIMMER_CLAIMED_TOTAL_QUERY,
    BYTE_PROTOCOL_PARAMS_QUERY,
    KEY_DATA_BYTES_QUERY,
    MILESTONE_STATS_QUERY
} from "./influxQueries";

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
 * N of nanoseconds in a millsecond.
 */
const NANOSECONDS_IN_MILLISECOND = 1000000;

/**
 * Milestone analyitics cache MAX size.
 */
const MILESTONE_CACHE_MAX = 20;

/**
 * The InfluxDb Client wrapper.
 */
export abstract class InfluxDbClient {
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
     * The network in context for this client.
     */
    private readonly _network: INetwork;

    /**
     * Create a new instance of InfluxDbClient.
     * @param network The network configuration.
     */
    constructor(network: INetwork) {
        this._network = network;
        this._dailyCache = initializeEmptyDailyCache();
        this._analyticsCache = {};
        this._milestoneCache = new Map();
    }

    /**
     * Build a new client instance asynchronously.
     * @returns Boolean representing that the client ping succeeded.
     */
    public async buildClient(): Promise<boolean> {
        const protocol = "https";
        const network = this._network.network;
        const host = this._network.analyticsInfluxDbEndpoint;
        const database = this._network.analyticsInfluxDbDatabase;
        const username = this._network.analyticsInfluxDbUsername;
        const password = this._network.analyticsInfluxDbPassword;

        if (host && database && username && password) {
            console.info("[InfluxDbClient(", network, ")] configuration found.");
            const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
            const options = {
                headers: {
                    "Authorization": `Basic ${token}`
                }
            };

            const influxDbClient = new InfluxDB({ protocol, port: 443, host, database, username, password, options });

            return influxDbClient.ping(1500).then((pingResults: IPingStats[]) => {
                if (pingResults.length > 0) {
                    const anyHostIsOnline = pingResults.some(ping => ping.online);

                    if (anyHostIsOnline) {
                        console.info("[InfluxDbClient(", network, ")] started!");
                        this._client = influxDbClient;
                        this.setupDataCollection();
                    }

                    return anyHostIsOnline;
                }

                return false;
            }).catch(e => {
                console.log("[InfluxDbClient(", network, ")] ping failed:", e);
                return false;
            });
        }

        console.info("[InfluxDbClient(", network, ")] configuration not found.");
        return false;
    }

    /**
     * Function to sort map entries in ascending order.
     * @param a The first entry
     * @param z The second entry
     * @returns Negative number if first entry is before second, positive otherwise.
     */
    protected readonly ENTRIES_ASC_SORT = (a: ITimedEntry, z: ITimedEntry) => (
        moment(a.time).isBefore(moment(z.time)) ? -1 : 1
    );

    /**
     * Setup a InfluxDb data collection periodic job.
     * Runs once at the start, then every COLLECT_DATA_FREQ_MS interval.
     */
    private setupDataCollection() {
        const network = this._network.network;
        console.info("[InfluxDbClient(", network, ")] data collection setup...");

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

            cron.schedule("*/5 * * * * *", async () => {
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
            console.log("[InfluxDbClient(", network, ")] client isn't configured for this network");
        }
    }

    /**
     * Performs the InfluxDb daily graph data collection.
     * Populates the dailyCache.
     */
    private async collectGraphsDaily() {
        console.info("[InfluxDbClient(", this._network.network, ")] collecting daily...");
        this.updateCacheEntry<IBlocksDailyInflux>(
            BLOCK_DAILY_QUERY,
            this._dailyCache.blocksDaily,
            "Blocks Daily"
        );
        this.updateCacheEntry<ITransactionsDailyInflux>(
            TRANSACTION_DAILY_QUERY,
            this._dailyCache.transactionsDaily,
            "Transactions Daily"
        );
        this.updateCacheEntry<IOutputsDailyInflux>(
            OUTPUTS_DAILY_QUERY,
            this._dailyCache.outputsDaily,
            "Outpus Daily"
        );
        this.updateCacheEntry<ITokensHeldPerOutputDailyInflux>(
            TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY,
            this._dailyCache.tokensHeldDaily,
            "Tokens Held Daily"
        );
        this.updateCacheEntry<IAddressesWithBalanceDailyInflux>(
            ADDRESSES_WITH_BALANCE_DAILY_QUERY,
            this._dailyCache.addressesWithBalanceDaily,
            "Addresses with balance Daily"
        );
        this.updateCacheEntry<IActiveAddressesDailyInflux>(
            TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY,
            this._dailyCache.activeAddressesDaily,
            "Number of Daily Active Addresses"
        );
        this.updateCacheEntry<ITokensTransferredDailyInflux>(
            TOKENS_TRANSFERRED_DAILY_QUERY,
            this._dailyCache.tokensTransferredDaily,
            "Tokens transferred Daily"
        );
        this.updateCacheEntry<IAliasActivityDailyInflux>(
            ALIAS_ACTIVITY_DAILY_QUERY,
            this._dailyCache.aliasActivityDaily,
            "Alias activity Daily"
        );
        this.updateCacheEntry<IUnlockConditionsPerTypeDailyInflux>(
            UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY,
            this._dailyCache.unlockConditionsPerTypeDaily,
            "Unlock conditions per type Daily"
        );
        this.updateCacheEntry<INftActivityDailyInflux>(
            NFT_ACTIVITY_DAILY_QUERY,
            this._dailyCache.nftActivityDaily,
            "Nft activity Daily"
        );
        this.updateCacheEntry<ITokensHeldWithUnlockConditionDailyInflux>(
            TOKENS_HELD_WITH_UC_DAILY_QUERY,
            this._dailyCache.tokensHeldWithUnlockConditionDaily,
            "Tokens held with Unlock condition Daily"
        );
        this.updateCacheEntry<IUnclaimedTokensDailyInflux>(
            UNCLAIMED_TOKENS_DAILY_QUERY,
            this._dailyCache.unclaimedTokensDaily,
            "Unclaimed Tokens Daily"
        );
        this.updateCacheEntry<IUnclaimedGenesisOutputsDailyInflux>(
            UNCLAIMED_GENESIS_OUTPUTS_DAILY_QUERY,
            this._dailyCache.unclaimedGenesisOutputsDaily,
            "Unclaimed genesis outputs Daily"
        );
        this.updateCacheEntry<ILedgerSizeDailyInflux>(
            LEDGER_SIZE_DAILY_QUERY,
            this._dailyCache.ledgerSizeDaily,
            "Ledger size Daily"
        );
        this.updateCacheEntry<IStorageDepositDailyInflux>(
            STORAGE_DEPOSIT_DAILY_QUERY,
            this._dailyCache.storageDepositDaily,
            "Storage Deposit Daily"
        );
    }

    /**
     * Performs the InfluxDb analytics data collection.
     * Populates the analyticsCache.
     */
    private async collectAnalytics() {
        console.info("[InfluxDbClient(", this._network.network, ")] collecting analytics...");
        try {
            for (const update of await
                this.queryInflux<ITimedEntry & { addressesWithBalance: string }>(
                    ADDRESSES_WITH_BALANCE_TOTAL_QUERY, null, this.getToNanoDate()
                )
            ) {
                this._analyticsCache.addressesWithBalance = update.addressesWithBalance;
            }

            for (const update of await
                this.queryInflux<ITimedEntry & { nativeTokensCount: string }>(
                    NATIVE_TOKENS_STAT_TOTAL_QUERY, null, this.getToNanoDate()
                )
            ) {
                this._analyticsCache.nativeTokensCount = update.nativeTokensCount;
            }

            for (const update of await
                this.queryInflux<ITimedEntry & { nftsCount: string }>(
                    NFT_STAT_TOTAL_QUERY, null, this.getToNanoDate()
                )
            ) {
                this._analyticsCache.nftsCount = update.nftsCount;
            }

            // Locked storage deposit
            let byteCost: number;
            let factorData: number;
            let factorKey: number;
            let bytesData: number;
            let bytesKey: number;

            for (const update of await
                this.queryInflux<ITimedEntry & { byteCost: string; factorData: string; factorKey: string }>(
                    BYTE_PROTOCOL_PARAMS_QUERY, null, this.getToNanoDate()
                )
            ) {
                byteCost = Number.parseInt(update.byteCost, 10);
                factorData = Number.parseInt(update.factorData, 10);
                factorKey = Number.parseInt(update.factorKey, 10);
            }

            for (const update of await
                this.queryInflux<ITimedEntry & { bytesData: string; bytesKey: string }>(
                    KEY_DATA_BYTES_QUERY, null, this.getToNanoDate()
                )
            ) {
                bytesData = Number.parseInt(update.bytesData, 10);
                bytesKey = Number.parseInt(update.bytesKey, 10);
            }

            if (byteCost && factorData && factorKey && bytesData && bytesKey) {
                const lockedStorageDeposit = byteCost * ((factorData * bytesData) + factorKey + bytesKey);
                this._analyticsCache.lockedStorageDeposit = lockedStorageDeposit.toString();
            }
        } catch (err) {
            console.warn("[InfluxDbClient(", this._network.network, ")] failed refreshing analytics", err);
        }
    }

    private async collectShimmerUnclaimed() {
        console.info("[InfluxDbClient(", this._network.network, ")] collecting shimmer...");
        try {
            for (const update of await
                this.queryInflux<ITimedEntry & { totalUnclaimedShimmer: string }>(
                    SHIMMER_CLAIMED_TOTAL_QUERY, null, this.getToNanoDate()
                )
            ) {
                this._analyticsCache.totalUnclaimedShimmer = update.totalUnclaimedShimmer;
            }
        } catch (err) {
            console.warn("[InfluxDbClient(", this._network.network, ")] failed refreshing analytics", err);
        }
    }

    private async collectMilestoneStats() {
        const debug = false;
        if (debug) {
            console.info("[InfluxDbClient(", this._network.network, ")] collecting milestone stats...");
        }
        try {
            for (const update of await
                this.queryInflux<ITimedEntry & {
                    milestoneIndex: number;
                    taggedData: number;
                    milestone: number;
                    transaction: number;
                    treasuryTransaction: number;
                    noPayload: number;
                }>(
                    MILESTONE_STATS_QUERY, null, this.getToNanoDate()
                )
            ) {
                if (update.milestoneIndex !== undefined && !this._milestoneCache.has(update.milestoneIndex)) {
                    const {
                        milestoneIndex, transaction, milestone, taggedData, treasuryTransaction, noPayload
                    } = update;
                    const blockCount = transaction + milestone + taggedData + treasuryTransaction + noPayload;
                    this._milestoneCache.set(milestoneIndex, {
                        milestoneIndex,
                        blockCount,
                        perPayloadType: {
                            transaction,
                            milestone,
                            taggedData,
                            treasuryTransaction,
                            noPayload
                        }
                    });

                    if (debug) {
                        console.info(
                            "[InfluxDbClient(", this._network.network, ")] milestone cache added",
                            this._milestoneCache.get(milestoneIndex)
                        );
                    }

                    if (this._milestoneCache.size > MILESTONE_CACHE_MAX) {
                        let lowestIndex: number;
                        for (const index of this._milestoneCache.keys()) {
                            if (!lowestIndex) {
                                lowestIndex = index;
                            }

                            if (milestoneIndex < lowestIndex) {
                                lowestIndex = index;
                            }
                        }

                        if (debug) {
                            console.info(
                                "[InfluxDbClient(", this._network.network, ")] milestone cache deleting",
                                this._milestoneCache.get(lowestIndex)
                            );
                        }
                        this._milestoneCache.delete(lowestIndex);
                    }
                }
            }
        } catch (err) {
            console.warn("[InfluxDbClient(", this._network.network, ")] failed refreshing milestone stats", err);
        }
    }

    /**
     * Update one cache entry with InfluxDb data.
     * Uses the date from the latest entry as FROM timestamp for the update.
     * @param queryTemplate The query template object.
     * @param queryTemplate.full Full query (no timespan) and parameterized (from, to).
     * @param queryTemplate.parameterized Parameterized query (from, to).
     * @param cacheEntryToFetch The cache entry to fetch.
     * @param description The optional entry description for logging.
     * @param debug The optional debug boolean to show more logs.
     */
    private updateCacheEntry<T extends ITimedEntry>(
        queryTemplate: { full: string; parameterized: string },
        cacheEntryToFetch: Map<DayKey, T>,
        description: string = "Daily entry",
        debug: boolean = false
    ) {
        const network = this._network.network;
        const fromNanoDate: INanoDate | null = this.getFromNanoDate(cacheEntryToFetch);

        if (debug) {
            console.debug(
                `[InfluxDbClient(${network})]Refreshing ${description} from date`,
                fromNanoDate ? fromNanoDate.toISOString() : null
            );
        }

        const query = fromNanoDate ?
            queryTemplate.parameterized :
            queryTemplate.full;

        this.queryInflux<T>(query, fromNanoDate, this.getToNanoDate()).then(results => {
            for (const update of results) {
                if (this.isAnyFieldNotNull<T>(update)) {
                    if (debug) {
                        console.debug(
                            `[InfluxDbClient(${network})] setting ${description} cache entry:`,
                            moment(update.time).format(DAY_KEY_FORMAT)
                        );
                    }

                    cacheEntryToFetch.set(moment(update.time).format(DAY_KEY_FORMAT), update);
                } else if (debug) {
                    console.warn(
                        `[InfluxDbClient(${network})] found empty result entry while populating cache:`,
                        update
                    );
                }
            }
        }).catch(e => {
            console.warn(`[InfluxDbClient(${network})] query ${description} failed:`, e);
        });
    }

    /**
     * Execute InfluxQL query.
     * @param query The query.
     * @param from The starting Date to use in the query.
     * @param to The ending Date to use in the query.
     */
    private async queryInflux<T>(query: string, from: INanoDate | null, to: INanoDate): Promise<IResults<T>> {
        const params = from ?
            { placeholders: { from: from.toNanoISOString(), to: to.toNanoISOString() } } :
            undefined;
        return this._client.query<T>(query, params);
    }

    /**
     * Compute the FROM Date for data update query from current cache entry.
     * @param cacheEntry The current cache entry map.
     * @returns The (from) (INano)Date.
     */
    private getFromNanoDate(cacheEntry: Map<DayKey, ITimedEntry>): INanoDate | null {
        let fromNanoDate: INanoDate | null;
        if (cacheEntry.size === 0) {
            fromNanoDate = null;
        } else {
            const lastDate = this.computeLastDateOfContinousSeries(cacheEntry);

            fromNanoDate = toNanoDate(
                // eslint-disable-next-line newline-per-chained-call
                (lastDate.hours(0).minutes(0).seconds(1).valueOf() * NANOSECONDS_IN_MILLISECOND).toString()
            );
        }

        return fromNanoDate;
    }

    /**
     * Get the last date (day) from cache entry,
     * which is part of a continous series of days (no holes in the data).
     * We then use this date and the start for next refresh query, so that if there are holes in the data,
     * that secion will try to be updated.
     * @param cacheEntry The current cache entry map.
     * @returns Moment object representing the latest date of continous data.
     */
    private computeLastDateOfContinousSeries(cacheEntry: Map<DayKey, ITimedEntry>): moment.Moment {
        const sortedEntries = Array.from(
            cacheEntry.values()
        ).sort(this.ENTRIES_ASC_SORT);

        const oldestEntry = sortedEntries[0];
        const start = moment(oldestEntry.time);
        let lastDay = start;

        for (let day = start; day.isBefore(moment(), "day"); day = day.add(1, "day")) {
            const key = day.format(DAY_KEY_FORMAT);

            if (cacheEntry.has(key)) {
                lastDay = day;
            } else {
                break;
            }
        }

        return lastDay;
    }

    /**
     * Compute the TO Date for data update query.
     * @returns Current datetime as INanoDate.
     */
    private getToNanoDate(): INanoDate {
        return toNanoDate((moment().valueOf() * NANOSECONDS_IN_MILLISECOND).toString());
    }

    /**
     * Helper function to check if any of the fields (except time) are non-null.
     * @param data Any object.
     * @returns True if any of the object fields (excludes time) is not null.
     */
    private isAnyFieldNotNull<T>(data: T): boolean {
        return Object.getOwnPropertyNames(data).filter(fName => fName !== "time").some(fName => data[fName] !== null);
    }
}

