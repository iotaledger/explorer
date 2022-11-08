export type TimespanOption = "one" | "six" | "year";

export interface ITransactionHistoryDownloadBody {
    timespan: TimespanOption;
}

