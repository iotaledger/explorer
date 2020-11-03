
export interface ITransactionActionRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The action to perform.
     */
    action: "isPromotable" | "promote" | "replay";

    /**
     * The hash to perform the action on.
     */
    hash: string;
}
