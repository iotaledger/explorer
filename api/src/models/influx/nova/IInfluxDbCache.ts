import { IBlocksDailyInflux, ITransactionsDailyInflux } from "./IInfluxTimedEntries";
import { DayKey } from "../types";

/**
 * The cache for influx graphs (daily).
 */
export interface IInfluxDailyCache {
    blocksDaily: Map<DayKey, IBlocksDailyInflux>;
    transactionsDaily: Map<DayKey, ITransactionsDailyInflux>;
}

/**
 * The helper to initialize empty maps
 * @returns The initial cache object
 */
export const initializeEmptyDailyCache = () => ({
    blocksDaily: new Map(),
    transactionsDaily: new Map(),
});
