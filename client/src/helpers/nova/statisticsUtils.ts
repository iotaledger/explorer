import moment from "moment";
import { IInfluxDailyResponse } from "~models/api/nova/influx/IInfluxDailyResponse";

export interface IStatisticsGraphsData {
    blocksDaily: DataPoint[];
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
