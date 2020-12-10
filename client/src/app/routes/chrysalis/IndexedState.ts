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
}
