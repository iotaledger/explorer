/**
 * Information about non-tethered neighbors that were refused (available only on the testnet network).
 */
export interface IRntn {
    /**
     * URL of a non-tethered neighbor.
     */
    url: string;

    /**
     * The maximum number of peers that are specified in the IRI configuration options.
     */
    maxPeers: number;
}
