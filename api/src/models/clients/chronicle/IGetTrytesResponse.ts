export interface IGetTrytesResponse {
    /**
     * The transaction trytes for the requested hashes.
     */
    trytes: string[];

    /**
     * The transaction milestones for the requested hashes.
     */
    milestones: (number | null)[];

    /**
     * Error.
     */
    error?: string;
}
