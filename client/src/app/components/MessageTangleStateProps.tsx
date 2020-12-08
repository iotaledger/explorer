import { MessageTangleStatus } from "../../models/messageTangleStatus";

export interface MessageTangleStateProps {
    /**
     * The tangle status.
     */
    status?: MessageTangleStatus;

    /**
     * The milestone that confirmed it.
     */
    milestoneIndex?: number;

    /**
     * The button click.
     */
    onClick?(): void;
}
