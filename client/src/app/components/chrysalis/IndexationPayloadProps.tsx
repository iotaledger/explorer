import { IIndexationPayload } from "@iota/iota2.js";
import * as H from "history";

export interface IndexationPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The indexation payload.
     */
    payload: IIndexationPayload;

    /**
     * History for navigation.
     */
    history: H.History;
}
