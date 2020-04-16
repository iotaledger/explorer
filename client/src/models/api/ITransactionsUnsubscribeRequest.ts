import { Network } from "../network";

export interface ITransactionsUnsubscribeRequest {
    /**
     * The network to search on.
     */
    network: Network;

    /**
     * The subscription id to unsubscribe.
     */
    subscriptionId: string;
}
