import { ReceiptMilestoneOption } from "@iota/sdk-wasm-stardust/web";
import * as H from "history";

export interface ReceiptPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The receipt payload.
     */
    payload: ReceiptMilestoneOption;

    /**
     * Display advanced mode.
     */
    advancedMode: boolean;

    /**
     * History for navigation.
     */
    history?: H.History;
}
