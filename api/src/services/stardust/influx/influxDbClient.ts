import { INanoDate, InfluxDB, IPingStats, IResults, toNanoDate } from "influx";
import moment from "moment";
import { INetwork } from "../../../models/db/INetwork";
import {
    IAddressesWithBalanceDailyInflux, IAliasActivityDailyInflux, IAvgAddressesPerMilestoneDailyInflux,
    IBlocksDailyInflux, ILedgerSizeDailyInflux, INftActivityDailyInflux, IOutputsDailyInflux,
    IStorageDepositDailyInflux, ITimedEntry, ITokensHeldPerOutputDailyInflux, ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux, ITransactionsDailyInflux, IUnclaimedGenesisOutputsDailyInflux,
    IUnclaimedTokensDailyInflux, IUnlockConditionsPerTypeDailyInflux
} from "../../../models/influx/influxData";
import { CACHE_INIT, InfluxDbClientCache } from "../../../models/influx/influxDbCache";
import {
    ADDRESSES_WITH_BALANCE_DAILY_PARAMETERIZED_QUERY, ALIAS_ACTIVITY_DAILY_PARAMETERIZED_QUERY,
    AVG_ACTIVE_ADDRESSES_PER_MILESTONE_DAILY_PARAMETERIZED_QUERY, BLOCK_DAILY_PARAMETERIZED_QUERY,
    LEDGER_SIZE_DAILY_PARAMETERIZED_QUERY, NFT_ACTIVITY_DAILY_PARAMETERIZED_QUERY, OUTPUTS_DAILY_PARAMETERIZED_QUERY,
    STORAGE_DEPOSIT_DAILY_PARAMETERIZED_QUERY,
    TOKENS_HELD_BY_OUTPUTS_DAILY_PARAMETERIZED_QUERY, TOKENS_HELD_WITH_UC_DAILY_PARAMETERIZED_QUERY,
    TOKENS_TRANSFERRED_DAILY_PARAMETERIZED_QUERY, TRANSACTION_DAILY_PARAMETERIZED_QUERY,
    UNCLAIMED_GENESIS_OUTPUTS_DAILY_PARAMETERIZED_QUERY, UNCLAIMED_TOKENS_DAILY_PARAMETERIZED_QUERY,
    UNLOCK_CONDITIONS_PER_TYPE_DAILY_PARAMETERIZED_QUERY
} from "./influxQueries";

/**
 * The collect job interval (1h).
 */
const COLLECT_DATA_FREQ_MS = 1000 * 60 * 60;

const NANOSECONDS_IN_MILLISECOND = 1000000;

/**
 * The timestamp to collect data FROM for Shimmer.
 * Tuesday, 27 September 2022 00:00:00
 */
const DEFAULT_FROM_TIMESTAMP_MS = 1664229600000;

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
    protected readonly _cache: InfluxDbClientCache;

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
        this.fetchInfluxCacheEntry<IBlocksDailyInflux>(
            BLOCK_DAILY_PARAMETERIZED_QUERY,
            this._cache.blocksDaily,
            "Blocks Daily"
        );
        this.fetchInfluxCacheEntry<ITransactionsDailyInflux>(
            TRANSACTION_DAILY_PARAMETERIZED_QUERY,
            this._cache.transactionsDaily,
            "Transactions Daily"
        );
        this.fetchInfluxCacheEntry<IOutputsDailyInflux>(
            OUTPUTS_DAILY_PARAMETERIZED_QUERY,
            this._cache.outputsDaily,
            "Outpus Daily"
        );
        this.fetchInfluxCacheEntry<ITokensHeldPerOutputDailyInflux>(
            TOKENS_HELD_BY_OUTPUTS_DAILY_PARAMETERIZED_QUERY,
            this._cache.tokensHeldDaily,
            "Tokens Held Daily"
        );
        this.fetchInfluxCacheEntry<IAddressesWithBalanceDailyInflux>(
            ADDRESSES_WITH_BALANCE_DAILY_PARAMETERIZED_QUERY,
            this._cache.addressesWithBalanceDaily,
            "Addresses with balance Daily"
        );
        this.fetchInfluxCacheEntry<IAvgAddressesPerMilestoneDailyInflux>(
            AVG_ACTIVE_ADDRESSES_PER_MILESTONE_DAILY_PARAMETERIZED_QUERY,
            this._cache.avgAddressesPerMilestoneDaily,
            "Avarage addresses with balance Daily"
        );
        this.fetchInfluxCacheEntry<ITokensTransferredDailyInflux>(
            TOKENS_TRANSFERRED_DAILY_PARAMETERIZED_QUERY,
            this._cache.tokensTransferredDaily,
            "Tokens transferred Daily"
        );
        this.fetchInfluxCacheEntry<IAliasActivityDailyInflux>(
            ALIAS_ACTIVITY_DAILY_PARAMETERIZED_QUERY,
            this._cache.aliasActivityDaily,
            "Alias activity Daily"
        );
        this.fetchInfluxCacheEntry<IUnlockConditionsPerTypeDailyInflux>(
            UNLOCK_CONDITIONS_PER_TYPE_DAILY_PARAMETERIZED_QUERY,
            this._cache.unlockConditionsPerTypeDaily,
            "Unlock conditions per type Daily"
        );
        this.fetchInfluxCacheEntry<INftActivityDailyInflux>(
            NFT_ACTIVITY_DAILY_PARAMETERIZED_QUERY,
            this._cache.nftActivityDaily,
            "Nft activity Daily"
        );
        this.fetchInfluxCacheEntry<ITokensHeldWithUnlockConditionDailyInflux>(
            TOKENS_HELD_WITH_UC_DAILY_PARAMETERIZED_QUERY,
            this._cache.tokensHeldWithUnlockConditionDaily,
            "Tokens held with Unlock condition Daily"
        );
        this.fetchInfluxCacheEntry<IUnclaimedTokensDailyInflux>(
            UNCLAIMED_TOKENS_DAILY_PARAMETERIZED_QUERY,
            this._cache.unclaimedTokensDaily,
            "Unclaimed Tokens Daily"
        );
        this.fetchInfluxCacheEntry<IUnclaimedGenesisOutputsDailyInflux>(
            UNCLAIMED_GENESIS_OUTPUTS_DAILY_PARAMETERIZED_QUERY,
            this._cache.unclaimedGenesisOutputsDaily,
            "Unclaimed genesis outputs Daily"
        );
        this.fetchInfluxCacheEntry<ILedgerSizeDailyInflux>(
            LEDGER_SIZE_DAILY_PARAMETERIZED_QUERY,
            this._cache.ledgerSizeDaily,
            "Ledger size Daily"
        );
        this.fetchInfluxCacheEntry<IStorageDepositDailyInflux>(
            STORAGE_DEPOSIT_DAILY_PARAMETERIZED_QUERY,
            this._cache.storageDepositDaily,
            "Storage Deposit Daily"
        );
    }

    /**
     * Update one cache entry with InfluxDb data.
     * Uses the date from the latest entry as FROM timestamp for the update.
     * @param queryTemplate The query template.
     * @param cacheEntryToFetch The cache entry to fetch.
     * @param description The optional entry description for logging.
     */
    private fetchInfluxCacheEntry<T extends ITimedEntry>(
        queryTemplate: string,
        cacheEntryToFetch: T[],
        description: string = "Daily entry"
    ) {
        const fromNanoDate: INanoDate = this.getFromNanoDate(cacheEntryToFetch);

        console.info(`Refreshing ${description} from date`, fromNanoDate.toISOString());
        this.queryInflux<T>(queryTemplate, fromNanoDate, this.getToNanoDate()).then(results => {
            for (const result of results) {
                if (this.isAnyFieldNotNull<T>(result)) {
                    cacheEntryToFetch.push(result);
                }
            }
            console.log(
                `${description} updated till`,
                moment(cacheEntryToFetch[cacheEntryToFetch.length - 1].time).format("DD-MM-YYYY")
            );
        }).catch(e => {
            console.log(`Influx query ${description} failed:`, e);
        });
    }

    /**
     * Execute InfluxQL query.
     * @param queryTemplate The query template.
     * @param from The starting Date to use in the query.
     * @param to The ending Date to use in the query.
     */
    private async queryInflux<T>(queryTemplate: string, from: INanoDate, to: INanoDate): Promise<IResults<T>> {
        const params = { placeholders: { from: from.toNanoISOString(), to: to.toNanoISOString() } };
        return this._client.query<T>(queryTemplate, params);
    }

    /**
     * Compute the FROM Date for data update query from current cache entry.
     * @param cacheEntry The current data.
     * @returns The (from) (INano)Date.
     */
    private getFromNanoDate(cacheEntry: ITimedEntry[]): INanoDate {
        let fromNanoDate: INanoDate;
        if (cacheEntry.length === 0) {
            // From beginning
            fromNanoDate = toNanoDate((DEFAULT_FROM_TIMESTAMP_MS * NANOSECONDS_IN_MILLISECOND).toString());
        } else {
            // Day after the latest entry date
            const lastDate = cacheEntry[cacheEntry.length - 1].time;
            const lastDatePlusOneDay = moment(lastDate).add(1, "day").valueOf();
            fromNanoDate = toNanoDate((lastDatePlusOneDay * NANOSECONDS_IN_MILLISECOND).toString());
        }

        return fromNanoDate;
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

