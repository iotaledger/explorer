import moment from "moment";
import { IInfluxDailyResponse } from "../../models/api/stardust/influx/IInfluxDailyResponse";

export interface IStatisticsGraphsData {
    blocksDaily: DataPoint[];
    transactionsDaily: DataPoint[];
    outputsDaily: DataPoint[];
    tokensHeldDaily: DataPoint[];
    addressesWithBalanceDaily: DataPoint[];
    avgAddressesPerMilestoneDaily: DataPoint[];
    tokensTransferredDaily: DataPoint[];
    aliasActivityDaily: DataPoint[];
    unlockConditionsPerTypeDaily: DataPoint[];
    nftActivityDaily: DataPoint[];
    tokensHeldWithUnlockConditionDaily: DataPoint[];
    unclaimedTokensDaily: DataPoint[];
    unclaimedGenesisOutputsDaily: DataPoint[];
    ledgerSizeDaily: DataPoint[];
    storageDepositDaily: DataPoint[];
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
        blocksDaily: data.blocksDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            transaction: day.transaction ?? 0,
            milestone: day.milestone ?? 0,
            taggedData: day.taggedData ?? 0,
            noPayload: day.noPayload ?? 0
        })) ?? [],
        transactionsDaily: data.transactionsDaily?.map(t => ({
            time: moment(t.time).add(1, "minute").unix(),
            confirmed: t.confirmed ?? 0,
            conflicting: t.conflicting ?? 0
        })) ?? [],
        outputsDaily: data.outputsDaily?.map(output => ({
            time: moment(output.time).add(1, "minute").unix(),
            basic: output.basic ?? 0,
            alias: output.alias ?? 0,
            foundry: output.foundry ?? 0,
            nft: output.nft ?? 0
        })) ?? [],
        tokensHeldDaily: data.tokensHeldDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            basic: day.basic ?? 0,
            alias: day.alias ?? 0,
            foundry: day.foundry ?? 0,
            nft: day.nft ?? 0
        })) ?? [],
        addressesWithBalanceDaily: data.addressesWithBalanceDaily?.map(entry => ({
            time: moment(entry.time).add(1, "minute").unix(),
            n: entry.addressesWithBalance ?? 0
        })) ?? [],
        avgAddressesPerMilestoneDaily: data.avgAddressesPerMilestoneDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            sending: day.addressesSending ?? 0,
            receiving: day.addressesReceiving ?? 0
        })) ?? [],
        tokensTransferredDaily: data.tokensTransferredDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            n: day.tokens ?? 0
        })) ?? [],
        aliasActivityDaily: data.aliasActivityDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            created: day.created ?? 0,
            governorChanged: day.governorChanged ?? 0,
            stateChanged: day.stateChanged ?? 0,
            destroyed: day.destroyed ?? 0
        })) ?? [],
        unlockConditionsPerTypeDaily: data.unlockConditionsPerTypeDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            timelock: day.timelock ?? 0,
            storageDepositReturn: day.storageDepositReturn ?? 0,
            expiration: day.expiration ?? 0
        })) ?? [],
        nftActivityDaily: data.nftActivityDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            created: day.created ?? 0,
            transferred: day.transferred ?? 0,
            destroyed: day.destroyed ?? 0
        })) ?? [],
        tokensHeldWithUnlockConditionDaily: data.tokensHeldWithUnlockConditionDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            timelock: day.timelock ?? 0,
            storageDepositReturn: day.storageDepositReturn ?? 0,
            expiration: day.expiration ?? 0
        })) ?? [],
        unclaimedTokensDaily: data.unclaimedTokensDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            n: day.unclaimed ?? 0
        })) ?? [],
        unclaimedGenesisOutputsDaily: data.unclaimedGenesisOutputsDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            n: day.unclaimed ?? 0
        })) ?? [],
        ledgerSizeDaily: data.ledgerSizeDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            keyBytes: day.keyBytes ?? 0,
            dataBytes: day.dataBytes ?? 0
        })) ?? [],
        storageDepositDaily: data.storageDepositDaily?.map(day => ({
            time: moment(day.time).add(1, "minute").unix(),
            n: day.storageDeposit ?? 0
        })) ?? []
    };
}

