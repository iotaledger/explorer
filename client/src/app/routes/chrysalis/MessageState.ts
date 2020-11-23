import { IMessage, IMessageMetadata } from "@iota/iota2.js";
import { ConfirmationState } from "../../../models/confirmationState";

export interface MessageState {
    /**
     * Message.
     */
    message?: IMessage;

    /**
     * Metadata.
     */
    metadata?: IMessageMetadata;

    /**
     * Validations if the message is conflicting.
     */
    validations?: string[];

    /**
     * Are we busy loading the children.
     */
    childrenBusy: boolean;

    /**
     * The children ids.
     */
    childrenIds?: string[];

    /**
     * The confirmation state.
     */
    confirmationState: ConfirmationState;
}
