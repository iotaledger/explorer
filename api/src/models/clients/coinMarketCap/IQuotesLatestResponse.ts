import { ICurrency } from "./ICurrency";
import { IStatus } from "./IStatus";

export interface IQuotesLatestResponse {
    /**
     * The data for the response.
     */
    data: ICurrency;
    /**
     * The status for the response.
     */
    status: IStatus;
}
