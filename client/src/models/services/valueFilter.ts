/**
 * The filter for values.
 */
export interface ValueFilter {
    zeroOnly: boolean;
    nonZeroOnly: boolean;
    transaction: boolean;
    milestone: boolean;
    indexed: boolean;
    noPayload: boolean;
}
