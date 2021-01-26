import { IMessage, IMessageMetadata } from "@iota/iota.js";
import { MessageTangleStatus } from "../../../models/messageTangleStatus";

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
     * Reason for the conflict.
     */
    conflictReason?: string;

    /**
     * Are we busy loading the children.
     */
    childrenBusy: boolean;

    /**
     * The children ids.
     */
    childrenIds?: string[];

    /**
     * The state of the message on the tangle.
     */
    messageTangleStatus: MessageTangleStatus;

    /**
     * The data urls.
     */
    dataUrls: {
        [id: string]: string;
    };

    /**
     * The selected data url.
     */
    selectedDataUrl: string;
}
