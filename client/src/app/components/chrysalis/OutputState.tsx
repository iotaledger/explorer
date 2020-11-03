export interface OutputState {
    /**
     * The addres in bech 32 format.
     */
    addressBech32?: string;

    /**
     * The address in hex form.
     */
    addressHex?: string;

    /**
     * The address type.
     */
    addressTypeLabel?: string;

    /**
     * The address type.
     */
    addressType?: number;

    /**
     * The amount.
     */
    amount?: number;

    /**
     * Format the amount in full.
     */
    formatFull: boolean;

    /**
     * Is genesis output.
     */
    isGenesis: boolean;
}
