/**
 * Activity on an address.
 */
export interface IAddress {
    /**
     * Address hash.
     */
    address: string;

    /**
     * Transaction hash.
     */
    transaction: string;

    /**
     * Milestone index.
     */
    milestoneIndex: number;
}
