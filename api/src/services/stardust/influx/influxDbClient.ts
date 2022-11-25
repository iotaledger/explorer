import { INanoDate, InfluxDB, IPingStats, IResults, toNanoDate } from "influx";
import moment from "moment";
import { INetwork } from "../../../models/db/INetwork";
import {
    ADDRESSES_WITH_BALANCE_DAILY_PARAMETERIZED_QUERY,
    AVG_ACTIVE_ADDRESSES_PER_MILESTONE_DAILY_PARAMETERIZED_QUERY,
    BLOCK_DAILY_PARAMETERIZED_QUERY, OUTPUTS_DAILY_PARAMETERIZED_QUERY,
    TOKENS_HELD_BY_OUTPUTS_DAILY_PARAMETERIZED_QUERY, TOKENS_TRANSFERRED_DAILY_PARAMETERIZED_QUERY,
    TRANSACTION_DAILY_PARAMETERIZED_QUERY
} from "./influxQueries";

export interface ITimedEntry {
    time: INanoDate;
}

export type IBlocksDailyInflux = {
    transaction: number | null;
    milestone: number | null;
    taggedData: number | null;
    noPayload: number | null;
} & ITimedEntry;

export type ITransactionsDailyInflux = {
    confirmed: number | null;
    conflicting: number | null;
} & ITimedEntry;

export type IOutputsDailyInflux = {
    basic: number | null;
    alias: number | null;
    foundry: number | null;
    nft: number | null;
} & ITimedEntry;

export type ITokensHeldPerOutputDailyInflux = {
    basic: number | null;
    alias: number | null;
    foundry: number | null;
    nft: number | null;
} & ITimedEntry;

export type IAddressesWithBalanceDailyInflux = ITimedEntry & {
    addressesWithBalance: number | null;
};

export type IAvgAddressesPerMilestoneDailyInflux = ITimedEntry & {
    addressesReceiving: number | null;
    addressesSending: number | null;
};

export type ITokensTransferredDailyInflux = ITimedEntry & {
    tokens: number | null;
};

export interface InfluxDbClientCache {
    blocksDaily: IBlocksDailyInflux[];
    transactionsDaily: ITransactionsDailyInflux[];
    outputsDaily: IOutputsDailyInflux[];
    tokensHeldDaily: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily: IAddressesWithBalanceDailyInflux[];
    avgAddressesPerMilestoneDaily: IAvgAddressesPerMilestoneDailyInflux[];
    tokensTransferredDaily: ITokensTransferredDailyInflux[];
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
            tokensTransferredDaily: []
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
        this.fetchDailyBlocksData();
        this.fetchDailyTransactionsData();
        this.fetchDailyOutputsData();
        this.fetchDailyTokensHeldData();
        this.fetchDailyAddressesWithBalanceData();
        this.fetchDailyAvgActiveAddressPerMilestoneData();
        this.fetchDailyTokensTransferredData();
    }

    private fetchDailyBlocksData() {
        const queryDesc = "Daily Blocks";
        const blocksDailyCache: IBlocksDailyInflux[] = this._cache.blocksDaily;
        const fromNanoDate: INanoDate = this.getFromNanoDate(blocksDailyCache);

        console.info(`Refreshing ${queryDesc} from date`, fromNanoDate.toISOString());
        this.queryInflux<IBlocksDailyInflux>(BLOCK_DAILY_PARAMETERIZED_QUERY, fromNanoDate, this.getToNanoDate())
            .then(results => {
                for (const result of results) {
                    const { milestone, transaction, taggedData, noPayload } = result;
                    // if any of these is not null we consider it a valid entry
                    if (milestone || transaction || taggedData || noPayload) {
                        blocksDailyCache.push(result);
                    }
                }
                console.log(
                    `${queryDesc} updated till`,
                    moment(blocksDailyCache[blocksDailyCache.length - 1].time).format("DD-MM-YYYY")
                );
            }).catch(e => {
                console.log(`Influx query ${queryDesc} failed:`, e);
            });
    }

    private fetchDailyTransactionsData() {
        const queryDesc = "Daily Transactions";
        const transactionsDailyCache: ITransactionsDailyInflux[] = this._cache.transactionsDaily;
        const fromNanoDate: INanoDate = this.getFromNanoDate(transactionsDailyCache);

        console.info(`Refreshing ${queryDesc} from date`, fromNanoDate.toISOString());
        this.queryInflux<ITransactionsDailyInflux>(
            TRANSACTION_DAILY_PARAMETERIZED_QUERY,
            fromNanoDate,
            this.getToNanoDate()
        ).then(results => {
            for (const result of results) {
                const { confirmed, conflicting } = result;
                // if any of these is not null we consider it a valid entry
                if (confirmed || conflicting) {
                    transactionsDailyCache.push(result);
                }
            }
            console.log(
                `${queryDesc} updated till`,
                moment(transactionsDailyCache[transactionsDailyCache.length - 1].time).format("DD-MM-YYYY")
            );
        }).catch(e => {
            console.log(`Influx query ${queryDesc} failed:`, e);
        });
    }

    private fetchDailyOutputsData() {
        const queryDesc = "Daily Outputs";
        const outputsDailyCache: IOutputsDailyInflux[] = this._cache.outputsDaily;
        const fromNanoDate: INanoDate = this.getFromNanoDate(outputsDailyCache);

        console.info(`Refreshing ${queryDesc} from date`, fromNanoDate.toISOString());
        this.queryInflux<IOutputsDailyInflux>(
            OUTPUTS_DAILY_PARAMETERIZED_QUERY,
            fromNanoDate,
            this.getToNanoDate()
        ).then(results => {
            for (const result of results) {
                const { basic, alias, foundry, nft } = result;
                // if any of these is not null we consider it a valid entry
                if (basic || alias || foundry || nft) {
                    outputsDailyCache.push(result);
                }
            }
            console.log(
                `${queryDesc} updated till`,
                moment(outputsDailyCache[outputsDailyCache.length - 1].time).format("DD-MM-YYYY")
            );
        }).catch(e => {
            console.log(`Influx query ${queryDesc} failed:`, e);
        });
    }

    private fetchDailyTokensHeldData() {
        const queryDesc = "Tokens Held Per Output Daily";
        const tokenHeldCache: ITokensHeldPerOutputDailyInflux[] = this._cache.tokensHeldDaily;
        const fromNanoDate: INanoDate = this.getFromNanoDate(tokenHeldCache);

        console.info(`Refreshing ${queryDesc} from date`, fromNanoDate.toISOString());
        this.queryInflux<ITokensHeldPerOutputDailyInflux>(
            TOKENS_HELD_BY_OUTPUTS_DAILY_PARAMETERIZED_QUERY,
            fromNanoDate,
            this.getToNanoDate()
        ).then(results => {
            for (const result of results) {
                const { basic, alias, foundry, nft } = result;
                // if any of these is not null we consider it a valid entry
                if (basic || alias || foundry || nft) {
                    tokenHeldCache.push(result);
                }
            }
            console.log(
                `${queryDesc} updated till`,
                moment(tokenHeldCache[tokenHeldCache.length - 1].time).format("DD-MM-YYYY")
            );
        }).catch(e => {
            console.log(`Influx query ${queryDesc} failed:`, e);
        });
    }

    private fetchDailyAddressesWithBalanceData() {
        const queryDesc = "Addresses With Balance Daily";
        const addressesWithBalanceCache: IAddressesWithBalanceDailyInflux[] = this._cache.addressesWithBalanceDaily;
        const fromNanoDate: INanoDate = this.getFromNanoDate(addressesWithBalanceCache);

        console.info(`Refreshing ${queryDesc} from date`, fromNanoDate.toISOString());
        this.queryInflux<IAddressesWithBalanceDailyInflux>(
            ADDRESSES_WITH_BALANCE_DAILY_PARAMETERIZED_QUERY,
            fromNanoDate,
            this.getToNanoDate()
        ).then(results => {
            for (const result of results) {
                const { addressesWithBalance } = result;
                // if any of these is not null we consider it a valid entry
                if (addressesWithBalance) {
                    addressesWithBalanceCache.push(result);
                }
            }
            console.log(
                `${queryDesc} updated till`,
                moment(addressesWithBalanceCache[addressesWithBalanceCache.length - 1].time).format("DD-MM-YYYY")
            );
        }).catch(e => {
            console.log(`Influx query ${queryDesc} failed:`, e);
        });
    }

    private fetchDailyAvgActiveAddressPerMilestoneData() {
        const queryDesc = "Avg Addresses Per Milestone Daily";
        const avgAddressesPerMsCache = this._cache.avgAddressesPerMilestoneDaily;
        const fromNanoDate: INanoDate = this.getFromNanoDate(avgAddressesPerMsCache);

        console.info(`Refreshing ${queryDesc} from date`, fromNanoDate.toISOString());
        this.queryInflux<IAvgAddressesPerMilestoneDailyInflux>(
            AVG_ACTIVE_ADDRESSES_PER_MILESTONE_DAILY_PARAMETERIZED_QUERY,
            fromNanoDate,
            this.getToNanoDate()
        ).then(results => {
            for (const result of results) {
                const { addressesReceiving, addressesSending } = result;
                // if any of these is not null we consider it a valid entry
                if (addressesReceiving || addressesSending) {
                    avgAddressesPerMsCache.push(result);
                }
            }
            console.log(
                `${queryDesc} updated till`,
                moment(avgAddressesPerMsCache[avgAddressesPerMsCache.length - 1].time).format("DD-MM-YYYY")
            );
        }).catch(e => {
            console.log(`Influx query ${queryDesc} failed:`, e);
        });
    }

    private fetchDailyTokensTransferredData() {
        const queryDesc = "Tokens Transferred Daily";
        const tokensTransferredCache: ITokensTransferredDailyInflux[] = this._cache.tokensTransferredDaily;
        const fromNanoDate: INanoDate = this.getFromNanoDate(tokensTransferredCache);

        console.info(`Refreshing ${queryDesc} from date`, fromNanoDate.toISOString());
        this.queryInflux<ITokensTransferredDailyInflux>(
            TOKENS_TRANSFERRED_DAILY_PARAMETERIZED_QUERY,
            fromNanoDate,
            this.getToNanoDate()
        ).then(results => {
            for (const result of results) {
                const { tokens } = result;
                // if any of these is not null we consider it a valid entry
                if (tokens) {
                    tokensTransferredCache.push(result);
                }
            }
            console.log(
                `${queryDesc} updated till`,
                moment(tokensTransferredCache[tokensTransferredCache.length - 1].time).format("DD-MM-YYYY")
            );
        }).catch(e => {
            console.log(`Influx query ${queryDesc} failed:`, e);
        });
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

    private async queryInflux<T>(queryTemplate: string, from: INanoDate, to: INanoDate): Promise<IResults<T>> {
        const params = { placeholders: { from: from.toNanoISOString(), to: to.toNanoISOString() } };
        return this._client.query<T>(queryTemplate, params);
    }
}

