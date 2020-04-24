import { IResponse } from "./IResponse";

export interface ITransactionsSubscribeResponse extends IResponse {
    /**
     * The network id.
     */
    network?: string;
    /**
     * The subscription id created.
     */
    subscriptionId?: string;
}
