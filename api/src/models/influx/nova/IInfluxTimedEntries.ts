import { ITimedEntry } from "../types";

export type IBlocksDailyInflux = ITimedEntry & {
    transaction: number | null;
    taggedData: number | null;
    validation: number | null;
    candidacy: number | null;
    noPayload: number | null;
};
