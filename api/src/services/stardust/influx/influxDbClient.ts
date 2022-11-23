import { INanoDate, InfluxDB, IPingStats, toNanoDate } from "influx";
import moment from "moment";
import { INetwork } from "../../../models/db/INetwork";
import { BLOCK_DAILY_STATS_PARAMETERIZED_QUERY } from "./influxQueries";

interface BlocksInflux {
    time: INanoDate;
    transaction: number | null;
    milestone: number | null;
    taggedData: number | null;
    noPayload: number | null;
}

export abstract class InfluxDbClient {
    protected _client: InfluxDB;

    private readonly _network: INetwork;

    private _collectIntervalHandle: NodeJS.Timer;

    private readonly _blocksDaily = new Map<string, BlocksInflux>();

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

            this.pingClient(influxDbClient).then(hosts => {
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
            });
        } else {
            console.info("Analytics Influx not configured for", network, "network.");
            return false;
        }
    }

    private async pingClient(client: InfluxDB): Promise<IPingStats[]> {
        return client.ping(1500);
    }

    private setupDataCollection() {
        if (!this._collectIntervalHandle && this._client) {
            this._collectIntervalHandle = setInterval(() => {
                this.collectData();
            }, 1000 * 10);
        } else {
            console.log("Data is already collecting or client isn't configured for", this._network.network);
        }
    }

    private collectData() {
        console.info("Collecting analytics influx data for", this._network.network);

        // requires nanoseconds timestamp
        const from = toNanoDate((1664229600000 * 1000 * 1000).toString());
        const to = toNanoDate((moment().valueOf() * 1000 * 1000).toString());

        const params = {
            placeholders: {
                from: from.toNanoISOString(),
                to: to.toNanoISOString()
            }
        };

        this._client.query<BlocksInflux>(
            BLOCK_DAILY_STATS_PARAMETERIZED_QUERY,
            params
        ).then(results => {
            for (const res of results) {
                const key = moment(res.time).subtract(1, "day").toISOString();
                this._blocksDaily.set(key, res);
            }
        }).catch(e => {
            console.log("Influx query failed:", e);
        });
    }
}

