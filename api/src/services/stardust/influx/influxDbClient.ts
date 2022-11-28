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


export interface InfluxDbClientCache {
    blocksDaily: IBlocksDailyInflux[];
    transactionsDaily: ITransactionsDailyInflux[];
    outputsDaily: IOutputsDailyInflux[];
    tokensHeldDaily: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily: IAddressesWithBalanceDailyInflux[];
    avgAddressesPerMilestoneDaily: IAvgAddressesPerMilestoneDailyInflux[];
    tokensTransferredDaily: ITokensTransferredDailyInflux[];
    aliasActivityDaily: IAliasActivityDailyInflux[];
    unlockConditionsPerTypeDaily: IUnlockConditionsPerTypeDailyInflux[];
    nftActivityDaily: INftActivityDailyInflux[];
    tokensHeldWithUnlockConditionDaily: ITokensHeldWithUnlockConditionDailyInflux[];
    unclaimedTokensDaily: IUnclaimedTokensDailyInflux[];
    unclaimedGenesisOutputsDaily: IUnclaimedGenesisOutputsDailyInflux[];
    ledgerSizeDaily: ILedgerSizeDailyInflux[];
    storageDepositDaily: IStorageDepositDailyInflux[];
}

// Tuesday, 27 September 2022 00:00:00
const DEFAULT_FROM_TIMESTAMP_MS = 1664229600000;

const NANOSECONDS_IN_MILLISECOND = 1000000;

// 10 min
const COLLECT_DATA_FREQ = 1000 * 60 * 10;

export abstract class InfluxDbClient {
    protected _client: InfluxDB;

    // This needs to preserve ordering
    protected readonly _cache: InfluxDbClientCache;

    private readonly _network: INetwork;

    private _collectIntervalHandle: NodeJS.Timer;

    constructor(network: INetwork) {
        this._network = network;
        this._cache = {
            blocksDaily: [],
            transactionsDaily: [],
            outputsDaily: [],
            tokensHeldDaily: [],
            addressesWithBalanceDaily: [],
            avgAddressesPerMilestoneDaily: [],
            tokensTransferredDaily: [],
            aliasActivityDaily: [],
            unlockConditionsPerTypeDaily: [],
            nftActivityDaily: [],
            tokensHeldWithUnlockConditionDaily: [],
            unclaimedTokensDaily: [],
            unclaimedGenesisOutputsDaily: [],
            ledgerSizeDaily: [],
            storageDepositDaily: []
        };
    }

    public async buildClient(): Promise<boolean> {
        const protocol = "https";
        const network = this._network.network;
        const host = this._network.analyticsInfluxDbEndpoint;
        const database = this._network.analyticsInfluxDbDatabase;
        const username = this._network.analyticsInfluxDbUsername;
        const password = this._network.analyticsInfluxDbPassword;

        if (host && database && username && password) {
            console.info("Found analytics Influx configuration for", network, "network.");

            const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
            const options = {
                headers: {
                    "Authorization": `Basic ${token}`
                }
            };

            const influxDbClient = new InfluxDB({ protocol, port: 443, host, database, username, password, options });

            return influxDbClient.ping(1500).then((hosts: IPingStats[]) => {
                console.log("Hosts influx", hosts);
                if (hosts.length > 0) {
                    const lastHostIsOnline = hosts[hosts.length - 1].online;

                    if (lastHostIsOnline) {
                        this._client = influxDbClient;
                        // here we hook into periodic data collection
                        this.setupDataCollection();
                    }

                    return lastHostIsOnline;
                }

                return false;
            }).catch(e => {
                console.log("Failed to ping influxDb for", network, e);
                return false;
            });
        }

        console.info("Analytics Influx not configured for", network, "network.");
        return false;
    }

    private setupDataCollection() {
        this.collectData();
        if (!this._collectIntervalHandle && this._client) {
            this._collectIntervalHandle = setInterval(() => this.collectData(), COLLECT_DATA_FREQ);
        } else {
            console.log("Data is already collecting or client isn't configured for", this._network.network);
        }
    }

    private collectData() {
        console.info("Collecting analytics influx data for", this._network.network);

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

    private async queryInflux<T>(queryTemplate: string, from: INanoDate, to: INanoDate): Promise<IResults<T>> {
        const params = { placeholders: { from: from.toNanoISOString(), to: to.toNanoISOString() } };
        return this._client.query<T>(queryTemplate, params);
    }

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

    private getToNanoDate(): INanoDate {
        return toNanoDate((moment().valueOf() * NANOSECONDS_IN_MILLISECOND).toString());
    }

    private isAnyFieldNotNull<T>(data: T): boolean {
        return Object.getOwnPropertyNames(data).filter(fName => fName !== "time").some(fName => data[fName] !== null);
    }
}

