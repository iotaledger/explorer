export type TimespanOption = "one" | "six" | "year" | "all";

export interface ITransactionHistoryDownloadBody {
    timespan: TimespanOption;
}

