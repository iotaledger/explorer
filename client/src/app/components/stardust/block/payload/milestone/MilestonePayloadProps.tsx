import { IMilestonePayload } from "@iota/iota.js-stardust";
import * as H from "history";

export interface MilestonePayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The milestone payload.
     */
    milestonePayload: IMilestonePayload;

    /**
     * History for navigation.
     */
    history: H.History;

    /**
     * The network protocol version.
     */
    protocolVersion: number;
}
