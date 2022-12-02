import { INanoDate, InfluxDB, IPingStats, IResults, toNanoDate } from "influx";
import moment from "moment";
import { INetwork } from "../../../models/db/INetwork";
import {
    CACHE_INIT, DayKey, DAY_KEY_FORMAT, IInfluxDbCache
} from "../../../models/influx/IInfluxDbCache";
import {
    IAddressesWithBalanceDailyInflux, IAliasActivityDailyInflux, IAvgAddressesPerMilestoneDailyInflux,
    IBlocksDailyInflux, ILedgerSizeDailyInflux, INftActivityDailyInflux, IOutputsDailyInflux,
    IStorageDepositDailyInflux, ITimedEntry, ITokensHeldPerOutputDailyInflux, ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux, ITransactionsDailyInflux, IUnclaimedGenesisOutputsDailyInflux,
    IUnclaimedTokensDailyInflux, IUnlockConditionsPerTypeDailyInflux
} from "../../../models/influx/IInfluxTimedEntries";
import {
    ADDRESSES_WITH_BALANCE_DAILY_QUERY, ALIAS_ACTIVITY_DAILY_QUERY,
    AVG_ACTIVE_ADDRESSES_PER_MILESTONE_DAILY_QUERY, BLOCK_DAILY_QUERY,
    LEDGER_SIZE_DAILY_QUERY, NFT_ACTIVITY_DAILY_QUERY, OUTPUTS_DAILY_QUERY,
    STORAGE_DEPOSIT_DAILY_QUERY,
    TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY, TOKENS_HELD_WITH_UC_DAILY_QUERY,
    TOKENS_TRANSFERRED_DAILY_QUERY, TRANSACTION_DAILY_QUERY,
    UNCLAIMED_GENESIS_OUTPUTS_DAILY_QUERY, UNCLAIMED_TOKENS_DAILY_QUERY,
    UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY
} from "./influxQueries";

/**
 * The collect job interval (1h).
 */
const COLLECT_DATA_FREQ_MS = 1000 * 60 * 60;

/**
 * N of nanoseconds in a millsecond.
 */
const NANOSECONDS_IN_MILLISECOND = 1000000;

/**
 * The InfluxDb Client wrapper.
 */
export abstract class InfluxDbClient {
    /**
     * The InfluxDb Client.
     */
    protected _client: InfluxDB;

    /**
     * The current cache instance.
     */
    protected readonly _cache: IInfluxDbCache;

    /**
     * The network in context for this client.
     */
    private readonly _network: INetwork;

    /**
     * The collect job handle.
     */
    private _collectIntervalHandle: NodeJS.Timer;

    /**
     * Create a new instance of InfluxDbClient.
     * @param network The network configuration.
     */
    constructor(network: INetwork) {
        this._network = network;
        this._cache = CACHE_INIT;
    }

    /**
     * Build a new client instance asynchronously.
     * @returns Boolean rapresenting that the client ping succeeded.
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
                        // here we hook into periodic data collection
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
        this.collectData();
        if (!this._collectIntervalHandle && this._client) {
            this._collectIntervalHandle = setInterval(() => this.collectData(), COLLECT_DATA_FREQ_MS);
        } else {
            console.log("[InfluxDbClient(", network, ")] data is already collecting or client isn't configured for");
        }
    }

    /**
     * Performs the InfluxDb bulk data collection.
     * Populates the cache.
     */
    private collectData() {
        console.info("[InfluxDbClient(", this._network.network, ")] collecting analytics data...");
        this.updateCacheEntry<IBlocksDailyInflux>(
            BLOCK_DAILY_QUERY,
            this._cache.blocksDaily,
            "Blocks Daily"
        );
        this.updateCacheEntry<ITransactionsDailyInflux>(
            TRANSACTION_DAILY_QUERY,
            this._cache.transactionsDaily,
            "Transactions Daily"
        );
        this.updateCacheEntry<IOutputsDailyInflux>(
            OUTPUTS_DAILY_QUERY,
            this._cache.outputsDaily,
            "Outpus Daily"
        );
        this.updateCacheEntry<ITokensHeldPerOutputDailyInflux>(
            TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY,
            this._cache.tokensHeldDaily,
            "Tokens Held Daily"
        );
        this.updateCacheEntry<IAddressesWithBalanceDailyInflux>(
            ADDRESSES_WITH_BALANCE_DAILY_QUERY,
            this._cache.addressesWithBalanceDaily,
            "Addresses with balance Daily"
        );
        this.updateCacheEntry<IAvgAddressesPerMilestoneDailyInflux>(
            AVG_ACTIVE_ADDRESSES_PER_MILESTONE_DAILY_QUERY,
            this._cache.avgAddressesPerMilestoneDaily,
            "Avarage addresses with balance Daily"
        );
        this.updateCacheEntry<ITokensTransferredDailyInflux>(
            TOKENS_TRANSFERRED_DAILY_QUERY,
            this._cache.tokensTransferredDaily,
            "Tokens transferred Daily"
        );
        this.updateCacheEntry<IAliasActivityDailyInflux>(
            ALIAS_ACTIVITY_DAILY_QUERY,
            this._cache.aliasActivityDaily,
            "Alias activity Daily"
        );
        this.updateCacheEntry<IUnlockConditionsPerTypeDailyInflux>(
            UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY,
            this._cache.unlockConditionsPerTypeDaily,
            "Unlock conditions per type Daily"
        );
        this.updateCacheEntry<INftActivityDailyInflux>(
            NFT_ACTIVITY_DAILY_QUERY,
            this._cache.nftActivityDaily,
            "Nft activity Daily"
        );
        this.updateCacheEntry<ITokensHeldWithUnlockConditionDailyInflux>(
            TOKENS_HELD_WITH_UC_DAILY_QUERY,
            this._cache.tokensHeldWithUnlockConditionDaily,
            "Tokens held with Unlock condition Daily"
        );
        this.updateCacheEntry<IUnclaimedTokensDailyInflux>(
            UNCLAIMED_TOKENS_DAILY_QUERY,
            this._cache.unclaimedTokensDaily,
            "Unclaimed Tokens Daily"
        );
        this.updateCacheEntry<IUnclaimedGenesisOutputsDailyInflux>(
            UNCLAIMED_GENESIS_OUTPUTS_DAILY_QUERY,
            this._cache.unclaimedGenesisOutputsDaily,
            "Unclaimed genesis outputs Daily"
        );
        this.updateCacheEntry<ILedgerSizeDailyInflux>(
            LEDGER_SIZE_DAILY_QUERY,
            this._cache.ledgerSizeDaily,
            "Ledger size Daily"
        );
        this.updateCacheEntry<IStorageDepositDailyInflux>(
            STORAGE_DEPOSIT_DAILY_QUERY,
            this._cache.storageDepositDaily,
            "Storage Deposit Daily"
        );
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

