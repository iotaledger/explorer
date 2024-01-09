import { IResponse } from "./IResponse";

export interface IFeedSubscribeResponse extends IResponse {
    /**
     * The network id.
     */
    network?: string;
    /**
     * The subscription id created.
     */
    subscriptionId?: string;
}
