import { IMessage, IMessageMetadata } from "@iota/iota.js";
import { MessageTangleStatus } from "../../../models/messageTangleStatus";

export interface MessageState {
    /**
     * The message id that was the parameter.
     */
    paramMessageId?: string;

    /**
     * The actual message Id in the case of an included message.
     */
    actualMessageId?: string;

    /**
     * Message.
     */
    message?: IMessage;

    /**
     * Metadata.
     */
    metadata?: IMessageMetadata;

    /**
     * The metadata failed.
     */
    metadataError?: string;

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

    /**
     * Display advanced mode.
     */
    advancedMode: boolean;
}
