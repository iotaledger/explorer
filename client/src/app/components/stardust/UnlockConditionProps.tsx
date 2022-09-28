import { UnlockConditionTypes } from "@iota/iota.js-stardust";

export interface UnlockConditionProps {
    /**
     * The unlock condition.
     */
    unlockCondition: UnlockConditionTypes;

    /**
     * Is the unlock condition pre-expanded.
     */
    isPreExpanded?: boolean;
}
