export interface IGetTrytesResponse {
    /**
     * Error.
     */
    error?: string;

    /**
     * The transaction trytes for the requested hashes.
     */
    trytes: string[];
}
