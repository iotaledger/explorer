import { IResponse } from "./IResponse";

export interface ITransactionsSubscribeResponse extends IResponse {
    /**
     * The subscription id created.
     */
    subscriptionId?: string;
}
