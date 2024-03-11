import moment from "moment";
import { IInfluxDailyResponse } from "~models/api/nova/influx/IInfluxDailyResponse";

export interface IStatisticsGraphsData {
    blocksDaily: DataPoint[];
    transactionsDaily: DataPoint[];
    outputsDaily: DataPoint[];
    tokensHeldDaily: DataPoint[];
    addressesWithBalanceDaily: DataPoint[];
    activeAddressesDaily: DataPoint[];
    tokensTransferredDaily: DataPoint[];
    anchorActivityDaily: DataPoint[];
    nftActivityDaily: DataPoint[];
    accountActivityDaily: DataPoint[];
    foundryActivityDaily: DataPoint[];
    delegationActivityDaily: DataPoint[];
    validatorsActivityDaily: DataPoint[];
    delegatorsActivityDaily: DataPoint[];
    delegationsActivityDaily: DataPoint[];
    stakingActivityDaily: DataPoint[];
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
        addressesWithBalanceDaily:
            data.addressesWithBalanceDaily?.map((entry) => ({
                time: moment(entry.time).add(1, "minute").unix(),
                n: entry.addressesWithBalance ?? 0,
            })) ?? [],
        activeAddressesDaily:
            data.activeAddressesDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                n: day.activeAddresses ?? 0,
            })) ?? [],
        tokensTransferredDaily:
            data.tokensTransferredDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                n: day.tokens ?? 0,
            })) ?? [],
        anchorActivityDaily:
            data.anchorActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                created: day.created ?? 0,
                governorChanged: day.governorChanged ?? 0,
                stateChanged: day.stateChanged ?? 0,
                destroyed: day.destroyed ?? 0,
            })) ?? [],
        nftActivityDaily:
            data.nftActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                created: day.created ?? 0,
                transferred: day.transferred ?? 0,
                destroyed: day.destroyed ?? 0,
            })) ?? [],
        accountActivityDaily:
            data.accountActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                created: day.created ?? 0,
                transferred: day.transferred ?? 0,
                destroyed: day.destroyed ?? 0,
            })) ?? [],
        foundryActivityDaily:
            data.foundryActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                created: day.created ?? 0,
                transferred: day.transferred ?? 0,
                destroyed: day.destroyed ?? 0,
            })) ?? [],
        delegationActivityDaily:
            data.delegationActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                created: day.created ?? 0,
                transferred: day.transferred ?? 0,
                destroyed: day.destroyed ?? 0,
            })) ?? [],
        validatorsActivityDaily:
            data.validatorsActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                candidates: day.candidates ?? 0,
                total: day.total ?? 0,
            })) ?? [],
        delegatorsActivityDaily:
            data.delegatorsActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                total: day.total ?? 0,
            })) ?? [],
        delegationsActivityDaily:
            data.delegationsActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                total: day.total ?? 0,
            })) ?? [],
        stakingActivityDaily:
            data.stakingActivityDaily?.map((day) => ({
                time: moment(day.time).add(1, "minute").unix(),
                total: day.total ?? 0,
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
