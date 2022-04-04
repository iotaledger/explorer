export interface TaggedDataPayloadState {
    /**
     * Hex view of index.
     */
    hexIndex: string;

    /**
     * UTF8 view of index.
     */
    utf8Index?: string;

    /**
     * Hex view of data.
     */
    hexData?: string;

    /**
     * UTF8 view of data.
     */
    utf8Data?: string;

    /**
     * JSON view of data.
     */
    jsonData?: string;

}

