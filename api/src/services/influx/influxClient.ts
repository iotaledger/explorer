import { INanoDate, InfluxDB, IResults, toNanoDate } from "influx";
import moment from "moment";
import logger from "../../logger";
import { INetwork } from "../../models/db/INetwork";
import { DayKey, DAY_KEY_FORMAT, ITimedEntry } from "../../models/influx/types";

/**
 * N of nanoseconds in a millsecond.
 */
export const NANOSECONDS_IN_MILLISECOND = 1000000;

/**
 * The InfluxDb Client wrapper.
 */
export abstract class InfluxDbClient {
    /**
     * The InfluxDb Client.
     */
    protected _client: InfluxDB;

    /**
     * The network in context for this client.
     */
    protected readonly _network: INetwork;

    /**
     * Create a new instance of InfluxDbClient.
     * @param network The network configuration.
     */
    constructor(network: INetwork) {
        this._network = network;
    }

    /**
     * Build a new client instance asynchronously.
     * @returns Boolean representing that the client ping succeeded.
     */
    public async buildClient(): Promise<boolean> {
        const protocol = this._network.analyticsInfluxDbProtocol || "https";
        const network = this._network.network;
        const [host, portString] = this._network.analyticsInfluxDbEndpoint.split(":");
        // Parse port string to int, or use default port for protocol
        const port = Number.parseInt(portString, 10) || (protocol === "https" ? 443 : 80);
        const database = this._network.analyticsInfluxDbDatabase;
        const username = this._network.analyticsInfluxDbUsername;
        const password = this._network.analyticsInfluxDbPassword;

        if (host && database && username && password) {
            logger.verbose(`[InfluxClient] Found configuration for (${network})]`);
            const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
            const options = {
                headers: {
                    Authorization: `Basic ${token}`,
                },
            };

            const influxDbClient = new InfluxDB({ protocol, port, host, database, username, password, options });

            this._client = influxDbClient;
            this.setupDataCollection();
            logger.info(`[InfluxClient] Client started for "${network}"...`);

            return true;
        }

        logger.warn(`[InfluxClient] Configuration not found for "${network}".`);
        return false;
    }

    /**
     * Update one cache entry with InfluxDb data.
     * Uses the date from the latest entry as FROM timestamp for the update.
     * @param queryTemplate The query template object.
     * @param queryTemplate.full Full query (no timespan) and partial (from, to).
     * @param queryTemplate.partial Parameterized query (from, to).
     * @param cacheEntryToFetch The cache entry to fetch.
     * @param description The optional entry description for logging.
     * @param debug The optional debug boolean to show more logs.
     */
    protected updateCacheEntry<T extends ITimedEntry>(
        queryTemplate: { full: string; partial: string },
        cacheEntryToFetch: Map<DayKey, T>,
        description: string = "Daily entry",
        debug: boolean = false,
    ) {
        const network = this._network.network;
        const fromNanoDate: INanoDate | null = this.getFromNanoDate(cacheEntryToFetch);

        if (debug) {
            logger.debug(
                `[InfluxClient] Refreshing ${description} from date
                ${fromNanoDate ? fromNanoDate.toISOString() : null} (${this._network.network})`,
            );
        }

        const query = fromNanoDate ? queryTemplate.partial : queryTemplate.full;

        this.queryInflux<T>(query, fromNanoDate, this.getToNanoDate())
            .then((results) => {
                for (const update of results) {
                    if (this.isAnyFieldNotNull<T>(update)) {
                        if (debug) {
                            logger.debug(
                                `[InfluxClient] Setting ${description} cache entry (${network}): ${moment(update.time).format(
                                    DAY_KEY_FORMAT,
                                )}`,
                            );
                        }

                        cacheEntryToFetch.set(moment(update.time).format(DAY_KEY_FORMAT), update);
                    } else if (debug) {
                        logger.warn(
                            `[InfluxClient] Found empty result entry while populating cache (${network}).
                            ${JSON.stringify(update)}`,
                        );
                    }
                }
            })
            .catch((e) => {
                logger.warn(`[InfluxClient] Query ${description} failed for (${network}). Cause ${e}`);
            });
    }

    /**
     * Execute InfluxQL query.
     * @param query The query.
     * @param from The starting Date to use in the query.
     * @param to The ending Date to use in the query.
     */
    protected async queryInflux<T>(query: string, from: INanoDate | null, to: INanoDate): Promise<IResults<T>> {
        const params = { placeholders: { from: undefined, to: to.toNanoISOString() } };

        if (from) {
            params.placeholders.from = from.toNanoISOString();
        }

        return this._client.query<T>(query, params);
    }

    protected mapToSortedValuesArray<T extends ITimedEntry>(cacheEntry: Map<string, T>): T[] {
        return Array.from(cacheEntry.values()).sort(this.ENTRIES_ASC_SORT);
    }

    /**
     * Compute the TO Date for data update query.
     * @returns Current datetime as INanoDate.
     */
    protected getToNanoDate(): INanoDate {
        return toNanoDate((moment().valueOf() * NANOSECONDS_IN_MILLISECOND).toString());
    }

    /**
     * Function to sort map entries in ascending order.
     * @param a The first entry
     * @param z The second entry
     * @returns Negative number if first entry is before second, positive otherwise.
     */
    private readonly ENTRIES_ASC_SORT = (a: ITimedEntry, z: ITimedEntry) => (moment(a.time).isBefore(moment(z.time)) ? -1 : 1);

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
                (lastDate.hours(0).minutes(0).seconds(1).valueOf() * NANOSECONDS_IN_MILLISECOND).toString(),
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
        const sortedEntries = Array.from(cacheEntry.values()).sort(this.ENTRIES_ASC_SORT);

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
     * Helper function to check if any of the fields (except time) are non-null.
     * @param data Any object.
     * @returns True if any of the object fields (excludes time) is not null.
     */
    private isAnyFieldNotNull<T>(data: T): boolean {
        return Object.getOwnPropertyNames(data)
            .filter((fName) => fName !== "time")
            .some((fName) => data[fName] !== null);
    }

    /**
     * Setup a InfluxDb data collection.
     */
    protected abstract setupDataCollection(): void;
}
