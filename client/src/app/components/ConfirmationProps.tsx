import { ConfirmationState } from "../../models/confirmationState";

export interface ConfirmationProps {
    /**
     * The confirmation state.
     */
    state: ConfirmationState;

    /**
     * The milestone that confirmed it.
     */
    milestoneIndex?: number;

    /**
     * The button click.
     */
    onClick?(): void;
}
