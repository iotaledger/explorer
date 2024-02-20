export type IFeedSelect = "block" | "milestone" | "commitments/latest";

export interface IFeedSubscribeRequest {
    /**
     * The network in context for the request.
     */
    network: string;

    /**
     * The specific feed to subscribe too (expected only on stardust feed).
     */
    feedSelect?: IFeedSelect;
}
