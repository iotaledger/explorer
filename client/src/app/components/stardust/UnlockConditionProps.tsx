import { UnlockConditionTypes } from "@iota/iota.js-stardust";
import * as H from "history";

export interface UnlockConditionProps {
    /**
     * The unlock condition.
     */
    unlockCondition: UnlockConditionTypes;
    /**
     * Network
     */
    network: string;

    /**
     * History for navigation.
     */
    history: H.History;
}
