import { ITimedEntry } from "../types";

export type IBlocksDailyInflux = ITimedEntry & {
    transaction: number | null;
    taggedData: number | null;
    validation: number | null;
    candidacy: number | null;
};

export type ITransactionsDailyInflux = ITimedEntry & {
    finalized: number | null;
    failed: number | null;
};

export type IOutputsDailyInflux = ITimedEntry & {
    basic: number | null;
    account: number | null;
    foundry: number | null;
    nft: number | null;
    anchor: number | null;
    delegation: number | null;
};
