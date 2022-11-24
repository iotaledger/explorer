import { INanoDate, InfluxDB, IPingStats, IResults, toNanoDate } from "influx";
import moment from "moment";
import { INetwork } from "../../../models/db/INetwork";
import { BLOCK_DAILY_STATS_PARAMETERIZED_QUERY } from "./influxQueries";

export interface BlocksInflux {
    time: INanoDate;
    transaction: number | null;
    milestone: number | null;
    taggedData: number | null;
    noPayload: number | null;
}

// Tuesday, 27 September 2022 00:00:00
const DEFAULT_FROM_TIMESTAMP_MS = 1664229600000;
// 10 min
const COLLECT_DATA_FREQ = 1000 * 60 * 10;

export abstract class InfluxDbClient {
    protected _client: InfluxDB;

    // This needs to preserve ordering
    protected readonly _blocksDaily: BlocksInflux[] = [];

    private readonly _network: INetwork;

    private _collectIntervalHandle: NodeJS.Timer;

    constructor(network: INetwork) {
        this._network = network;
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
        this.refreshDailyBlocksData();
    }

    private refreshDailyBlocksData() {
        const queryDesc = "Daily Blocks";
        const fromNanoDate: INanoDate = this.getFromNanoDate();
        const nowNanoDate: INanoDate = toNanoDate((moment().valueOf() * 1000 * 1000).toString());

        console.info(`Refreshing ${queryDesc} from date`, fromNanoDate.toISOString());
        this.queryInflux<BlocksInflux>(BLOCK_DAILY_STATS_PARAMETERIZED_QUERY, fromNanoDate, nowNanoDate)
            .then(results => {
                for (const blocksInfo of results) {
                    const { milestone, transaction, taggedData, noPayload } = blocksInfo;
                    if (milestone || transaction || taggedData || noPayload) {
                        // if any of these is not null we consider it a valid entry
                        // console.log("Adding block with data", moment(blocksInfo.time).format("DD-MM-YYYY"));
                        this._blocksDaily.push(blocksInfo);
                    }
                }

                console.log(
                    "Blocks daily updated till",
                    moment(this._blocksDaily[this._blocksDaily.length - 1].time).format("DD-MM-YYYY")
                );
            }).catch(e => {
                console.log(`Influx query ${queryDesc} failed:`, e);
            });
    }

    private getFromNanoDate(): INanoDate {
        let fromNanoDate: INanoDate;
        if (this._blocksDaily.length === 0) {
            // From beginning
            fromNanoDate = toNanoDate((DEFAULT_FROM_TIMESTAMP_MS * 1000 * 1000).toString());
        } else {
            // Day after the latest entry date
            const lastDate = this._blocksDaily[this._blocksDaily.length - 1].time;
            fromNanoDate = toNanoDate((moment(lastDate).add(1, "day").valueOf() * 1000 * 1000).toString());
        }

        return fromNanoDate;
    }

    private async queryInflux<T>(queryTemplate: string, from: INanoDate, to: INanoDate): Promise<IResults<T>> {
        const params = { placeholders: { from: from.toNanoISOString(), to: to.toNanoISOString() } };
        return this._client.query<T>(queryTemplate, params);
    }
}

