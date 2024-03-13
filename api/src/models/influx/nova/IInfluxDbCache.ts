import { IBlocksDailyInflux, IOutputsDailyInflux, ITransactionsDailyInflux } from "./IInfluxTimedEntries";
import { DayKey } from "../types";

/**
 * The cache for influx graphs (daily).
 */
export interface IInfluxDailyCache {
    blocksDaily: Map<DayKey, IBlocksDailyInflux>;
    transactionsDaily: Map<DayKey, ITransactionsDailyInflux>;
    outputsDaily: Map<DayKey, IOutputsDailyInflux>;
}

interface IEpochAnalyticStats {
    epochIndex: number;
    blockCount: number;
    perPayloadType: {
        transaction: number;
        taggedData: number;
        candidacy: number;
        noPayload: number;
    };
}

/**
 * The epoch stats cache. Map epoch index to stats.
 */
export type IInfluxEpochAnalyticsCache = Map<number, IEpochAnalyticStats>;

/**
 * The helper to initialize empty maps
 * @returns The initial cache object
 */
export const initializeEmptyDailyCache = () => ({
    blocksDaily: new Map(),
    transactionsDaily: new Map(),
    outputsDaily: new Map(),
});
