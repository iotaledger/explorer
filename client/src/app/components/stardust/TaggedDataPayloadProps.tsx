import { ITaggedDataPayload } from "@iota/iota.js-stardust";
import * as H from "history";

export interface TaggedDataPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The tagged data payload.
     */
    payload: ITaggedDataPayload;

    /**
     * History for navigation.
     */
    history: H.History;

    /**
     * Display advanced mode.
     */
     advancedMode: boolean;
}

