import { TangleStatus } from "~models/tangleStatus";

export interface MessageTangleStateProps {
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
     * The message has conflicts.
     */
    hasConflicts?: boolean;

    /**
     * The button click.
     */
    onClick?(messageId?: string): void;
}
