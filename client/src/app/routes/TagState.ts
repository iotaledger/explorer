export interface TagState {
    /**
     * The tag to display.
     */
    tag?: string;

    /**
     * The tag remainder.
     */
    tagFill?: string;

    /**
     * Transaction hashes for the tag.
     */
    hashes?: string[];

    /**
     * The total number of hashes.
     */
    totalCount?: string;

    /**
     * The items exceeded the limit.
     */
    limitExceeded?: boolean;

    /**
     * The status.
     */
    status: string;
}
