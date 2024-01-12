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
     * Hex view of index.
     */
    hexIndex?: string;

    /**
     * The index length in bytes.
     */
    indexLengthBytes?: number;

    /**
     * Display advanced mode.
     */
     advancedMode: boolean;

     /**
      * Cursor for next chunk of data.
      */
     cursor?: string;
}
