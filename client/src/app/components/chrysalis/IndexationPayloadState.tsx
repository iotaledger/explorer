export interface IndexationPayloadState {
    /**
     * Hex view of index.
     */
    hexIndex: string;

    /**
     * UTF8 view of index.
     */
    utf8Index: string;

    /**
     * The index length in bytes.
     */
    indexLengthBytes: number;

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

    /**
     * The data length in bytes.
     */
    dataLengthBytes?: number;
}
