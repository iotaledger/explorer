import { INanoDate, InfluxDB, IPingStats, IResults, toNanoDate } from "influx";
import moment from "moment";
import { INetwork } from "../../../models/db/INetwork";
import { BLOCK_DAILY_PARAMETERIZED_QUERY, TRANSACTION_DAILY_PARAMETERIZED_QUERY } from "./influxQueries";

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

export interface InfluxDbClientCache {
    blocksDaily: IBlocksDailyInflux[];
    transactionsDaily: ITransactionsDailyInflux[];
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
            transactionsDaily: []
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
                        // console.log("Adding block with data", moment(blocksInfo.time).format("DD-MM-YYYY"));
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
                    // console.log("Adding block with data", moment(blocksInfo.time).format("DD-MM-YYYY"));
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

