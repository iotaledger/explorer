export interface OutputState {
    /**
     * Format the amount in full.
     */
    formatFull: boolean;

    /**
     * Is genesis output.
     */
    isGenesis: boolean;

    /**
     * The output hash for transaction id.
     */
    outputHash: string;
}
