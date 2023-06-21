import { TaggedDataPayload } from "@iota/iota.js-stardust";
import * as H from "history";

export interface TaggedDataPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The tagged data payload.
     */
    payload: TaggedDataPayload;

    /**
     * History for navigation.
     */
    history: H.History;
}

