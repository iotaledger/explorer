import { InfluxDB } from "influx";
import cron from "node-cron";
import {
    BLOCK_DAILY_QUERY,
    EPOCH_STATS_QUERY,
    EPOCH_STATS_QUERY_BY_INDEX,
    OUTPUTS_DAILY_QUERY,
    TRANSACTION_DAILY_QUERY,
} from "./influxQueries";
import logger from "../../../logger";
import { IEpochAnalyticStats } from "../../../models/api/nova/stats/epoch/IEpochAnalyticStats";
import { INetwork } from "../../../models/db/INetwork";
import { IInfluxDailyCache, IInfluxEpochAnalyticsCache, initializeEmptyDailyCache } from "../../../models/influx/nova/IInfluxDbCache";
import { IBlocksDailyInflux, IOutputsDailyInflux, ITransactionsDailyInflux } from "../../../models/influx/nova/IInfluxTimedEntries";
import { ITimedEntry } from "../../../models/influx/types";
import { InfluxDbClient } from "../../influx/influxClient";

type EpochUpdate = ITimedEntry & {
    epochIndex: number;
    taggedData: number;
    candidacy: number;
    transaction: number;
    noPayload: number;
};

/**
 * Epoch analyitics cache MAX size.
 */
const EPOCH_CACHE_MAX = 20;

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
     * The current influx epoch analytics cache instance.
     */
    protected readonly _epochCache: IInfluxEpochAnalyticsCache;

    /**
     * The network in context for this client.
     */
    protected readonly _network: INetwork;

    constructor(network: INetwork) {
        super(network);
        this._dailyCache = initializeEmptyDailyCache();
        this._epochCache = new Map();
    }

    public get blocksDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.blocksDaily);
    }

    public get transactionsDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.transactionsDaily);
    }

    public get outputsDaily() {
        return this.mapToSortedValuesArray(this._dailyCache.outputsDaily);
    }

    public async fetchAnalyticsForEpoch(epochIndex: number) {
        await this.collectEpochStatsByIndex(epochIndex);
        return this._epochCache.get(epochIndex);
    }

    public async fetchAnalyticsForEpochWithRetries(epochIndex: number): Promise<IEpochAnalyticStats | undefined> {
        const MAX_RETRY = 30;
        const RETRY_TIMEOUT = 350;

        let retries = 0;
        let maybeEpochStats = this._epochCache.get(epochIndex);

        while (!maybeEpochStats && retries < MAX_RETRY) {
            retries += 1;
            logger.debug(`[InfluxNova] Try ${retries} of fetching epoch stats for ${epochIndex}`);
            maybeEpochStats = this._epochCache.get(epochIndex);

            await new Promise((f) => setTimeout(f, RETRY_TIMEOUT));
        }

        return maybeEpochStats;
    }

    protected setupDataCollection() {
        const network = this._network.network;
        logger.verbose(`[InfluxNova] Setting up data collection for (${network}).`);

        // eslint-disable-next-line no-void
        void this.collectGraphsDaily();
        // eslint-disable-next-line no-void
        void this.collectEpochStats();

        if (this._client) {
            cron.schedule("*/4 * * * * *", async () => {
                // eslint-disable-next-line no-void
                void this.collectEpochStats();
            });
        }
    }

    /**
     * Performs the InfluxDb daily graph data collection.
     * Populates the dailyCache.
     */
    private async collectGraphsDaily() {
        logger.verbose(`[InfluxNova] Collecting daily stats for "${this._network.network}"`);
        this.updateCacheEntry<IBlocksDailyInflux>(BLOCK_DAILY_QUERY, this._dailyCache.blocksDaily, "Blocks Daily", true);
        this.updateCacheEntry<ITransactionsDailyInflux>(TRANSACTION_DAILY_QUERY, this._dailyCache.transactionsDaily, "Transactions Daily");
        this.updateCacheEntry<IOutputsDailyInflux>(OUTPUTS_DAILY_QUERY, this._dailyCache.outputsDaily, "Outputs Daily");
    }

    /**
     * Get the epoch analytics by index and set it in the cache.
     * @param epochIndex - The epoch index.
     */
    private async collectEpochStatsByIndex(epochIndex: number) {
        try {
            for (const update of await this._client.query<EpochUpdate>(EPOCH_STATS_QUERY_BY_INDEX, {
                placeholders: { epochIndex },
            })) {
                this.updateEpochCache(update);
            }
        } catch (err) {
            logger.warn(`[InfluxNova] Failed refreshing epoch stats for "${this._network.network}". Cause: ${err}`);
        }
    }

    /**
     * Get the epoch analytics and set it in the cache.
     */
    private async collectEpochStats() {
        logger.debug(`[InfluxNova] Collecting epoch stats for "${this._network.network}"`);
        try {
            for (const update of await this.queryInflux<EpochUpdate>(EPOCH_STATS_QUERY, null, this.getToNanoDate())) {
                this.updateEpochCache(update);
            }
        } catch (err) {
            logger.warn(`[InfluxNova] Failed refreshing epoch stats for "${this._network.network}". Cause: ${err}`);
        }
    }

    private updateEpochCache(update: EpochUpdate) {
        if (update.epochIndex !== undefined && !this._epochCache.has(update.epochIndex)) {
            const { epochIndex, transaction, candidacy, taggedData, noPayload } = update;
            const blockCount = transaction + candidacy + taggedData + noPayload;
            this._epochCache.set(epochIndex, {
                epochIndex,
                blockCount,
                perPayloadType: {
                    transaction,
                    candidacy,
                    taggedData,
                    noPayload,
                },
            });

            logger.debug(`[InfluxNova] Added epoch index "${epochIndex}" to cache for "${this._network.network}"`);

            if (this._epochCache.size > EPOCH_CACHE_MAX) {
                let lowestIndex: number;
                for (const index of this._epochCache.keys()) {
                    if (!lowestIndex) {
                        lowestIndex = index;
                    }

                    if (epochIndex < lowestIndex) {
                        lowestIndex = index;
                    }
                }

                logger.debug(`[InfluxNova] Deleting epoch index "${lowestIndex}" ("${this._network.network}")`);

                this._epochCache.delete(lowestIndex);
            }
        }
    }
}
