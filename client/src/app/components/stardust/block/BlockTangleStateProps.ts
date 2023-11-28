import { TangleStatus } from "~models/tangleStatus";

export interface BlockTangleStateProps {
    /**
     * The network the request is for.
     */
    network: string;

    /**
     * The tangle status.
     */
    status?: TangleStatus;

    /**
     * The milestone that confirmed it.
     */
    milestoneIndex?: number;

    /**
     * The block has conflicts.
     */
    hasConflicts?: boolean;

    /**
     * The conflict reason.
     */
    conflictReason?: string;

    /**
     * The button click.
     */
    onClick?(blockId?: string): void;
}

