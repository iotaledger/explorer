export type IFeedSelect = "block";

export interface IFeedSubscribeRequest {
    /**
     * The network in context for the request.
     */
    network: string;

    /**
     * The specific feed to subscribe too.
     */
    feedSelect: IFeedSelect;
}
