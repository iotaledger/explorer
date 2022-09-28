import { IMilestonePayload } from "@iota/iota.js-stardust";

export interface MilestonePayloadState {
    /**
     * The blockId of the milestone.
     */
    blockId?: string;

    /**
     * The milestoneId of the milestone.
     */
    milestoneId?: string;

    /**
     * Milestone.
     */
    milestone?: IMilestonePayload;

    /**
     * The previous milestone is available.
     */
    previousIndex: number;

    /**
     * The next milestone is available.
     */
    nextIndex: number;

    /**
     * The previous milestone is available.
     */
    hasPrevious: boolean;

    /**
     * The next milestone is available.
     */
    hasNext: boolean;
}
