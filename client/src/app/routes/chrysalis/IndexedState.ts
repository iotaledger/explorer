import { IMessage } from "@iota/iota.js";

export interface IndexedState {
    /**
     * Is the component status busy.
     */
    statusBusy: boolean;

    /**
     * The status.
     */
    status: string;

    /**
     * The ids of the indexation messages.
     */
    messageIds?: string[];

    /**
     * The content of the indexation messages.
     */
    messages?: IMessage[];

    /**
     * Hex view of index.
     */
    hexIndex?: string;

    /**
     * UTF8 view of index.
     */
    utf8Index?: string;
}
