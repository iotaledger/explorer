import { MamMode } from "@iota/mam.js";

export interface StreamsV0State {
    /**
     * The mam channel details to lookup.
     */
    root: string;

    /**
     * The validation message for the root.
     */
    rootValidation: string;

    /**
     * The mode for the mam channel.
     */
    mode: MamMode;

    /**
     * The sideKey for the mam channel.
     */
    sideKey: string;

    /**
     * The validation message for the key.
     */
    sideKeyValidation: string;

    /**
     * Mam item details.
     */
    packets: {
        /**
         * The channel item root.
         */
        root: string;

        /**
         * The channel item address.
         */
        nextRoot: string;

        /**
         * The channel item tag.
         */
        tag: string;

        /**
         * The raw message.
         */
        rawMessageTrytes?: string;

        /**
         * The decoded message.
         */
        message?: string;

        /**
         * The decoded message.
         */
        messageType?: string;

        /**
         * Show the raw message trytes.
         */
        showRawMessageTrytes: boolean;
    }[];

    /**
     * Is the component valid.
     */
    isValid: boolean;

    /**
     * Is the component status busy.
     */
    statusBusy: boolean;

    /**
     * The status.
     */
    status: string;
}
