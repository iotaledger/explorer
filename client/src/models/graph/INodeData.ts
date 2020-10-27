export interface INodeData {
    /**
     * The transaction tag.
     */
    tag?: string;

    /**
     * The transaction value.
     */
    value?: number;

    /**
     * The transaction address.
     */
    address?: string;

    /**
     * The transaction bundle.
     */
    bundle?: string;

    /**
     * The transaction milestone.
     */
    milestone?: number;

    /**
     * Is the transaction confirmed.
     */
    confirmed?: boolean;
}
