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
     * Output hash to link to.
     */
    outputHash: string;
}
