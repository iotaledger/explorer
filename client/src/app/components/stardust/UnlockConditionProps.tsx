import { UnlockCondition } from "@iota/sdk-wasm-stardust/web";

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
