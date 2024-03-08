import moment from "moment";
import { IInfluxDailyResponse } from "~models/api/nova/influx/IInfluxDailyResponse";

export interface IStatisticsGraphsData {
    blocksDaily: DataPoint[];
    transactionsDaily: DataPoint[];
    outputsDaily: DataPoint[];
    tokensHeldDaily: DataPoint[];
}

export interface DataPoint {
    [key: string]: number;
    time: number;
}

/**
 * Build the generic data ready for Statistics page graphs from reponse.
 * @param data The raw data from api
 * @returns The transformed data for graphs.
 */
export function mapDailyStatsToGraphsData(data: IInfluxDailyResponse): IStatisticsGraphsData {
    return {
        blocksDaily:
            data.blocksDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                transaction: day.transaction ?? 0,
                taggedData: day.taggedData ?? 0,
                validation: day.validation ?? 0,
                candidacy: day.candidacy ?? 0,
            })) ?? [],
        transactionsDaily:
            data.transactionsDaily?.map((t) => ({
                time: moment(t.time).add(1, "minute").unix(),
                finalized: t.finalized ?? 0,
                failed: t.failed ?? 0,
            })) ?? [],
        outputsDaily:
            data.outputsDaily?.map((output) => ({
                time: moment(output.time).add(1, "minute").unix(),
                basic: output.basic ?? 0,
                account: output.account ?? 0,
                foundry: output.foundry ?? 0,
                nft: output.nft ?? 0,
                anchor: output.anchor ?? 0,
                delegation: output.delegation ?? 0,
            })) ?? [],
        tokensHeldDaily:
            data.tokensHeldDaily?.map((output) => ({
                time: moment(output.time).add(1, "minute").unix(),
                basic: output.basic ?? 0,
                account: output.account ?? 0,
                foundry: output.foundry ?? 0,
                nft: output.nft ?? 0,
                anchor: output.anchor ?? 0,
                delegation: output.delegation ?? 0,
            })) ?? [],
    };
}

/**
 * Generator function to yield incrementing string ids.
 * @yields next id.
 */
export function* idGenerator(): Generator<string, string, string> {
    let id: number = 0;
    while (true) {
        yield (id++).toString();
    }
}
