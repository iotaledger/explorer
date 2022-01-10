import { MessageTangleStatus } from "../../models/messageTangleStatus";

export interface MessageTangleStateProps {
    /**
     * The network the request is for.
     */
    network: string;

    /**
     * The tangle status.
     */
    status?: MessageTangleStatus;

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
