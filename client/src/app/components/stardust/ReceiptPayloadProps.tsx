import { IReceiptMilestoneOption } from "@iota/iota.js-stardust";
import * as H from "history";

export interface ReceiptPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The receipt payload.
     */
    payload: IReceiptMilestoneOption;

    /**
     * Display advanced mode.
     */
    advancedMode: boolean;

    /**
     * History for navigation.
     */
    history?: H.History;
}
