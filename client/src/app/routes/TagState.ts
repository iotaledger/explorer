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
     * The items exceeded the limit.
     */
    limitExceeded?: boolean;

    /**
     * Is the component busy.
     */
    statusBusy: boolean;

    /**
     * The status.
     */
    status: string;
}
