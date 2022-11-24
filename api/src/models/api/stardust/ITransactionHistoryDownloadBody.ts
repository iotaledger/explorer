import moment from "moment";

export interface ITransactionHistoryDownloadBody {
    targetDate: moment.Moment;
}
