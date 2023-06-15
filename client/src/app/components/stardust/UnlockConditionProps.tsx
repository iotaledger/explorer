import { UnlockCondition } from "@iota/iota.js-stardust";

export interface UnlockConditionProps {
    /**
     * The unlock condition.
     */
    unlockCondition: UnlockCondition;

    /**
     * Is the unlock condition pre-expanded.
     */
    isPreExpanded?: boolean;
}
