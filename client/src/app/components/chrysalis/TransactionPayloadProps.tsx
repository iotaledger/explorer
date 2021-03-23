import { ITransactionPayload } from "@iota/iota.js";
import * as H from "history";

export interface TransactionPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The transaction payload.
     */
    payload: ITransactionPayload;

    /**
     * History for navigation.
     */
    history: H.History;

    /**
     * Display advanced mode.
     */
    advancedMode: boolean;
}
