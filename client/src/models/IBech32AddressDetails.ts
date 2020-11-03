export interface IBech32AddressDetails {
    /**
     * Bech32 version of the address.
     */
    bech32?: string;

    /**
     * The raw address a hex.
     */
    hex?: string;

    /**
     * The raw address type.
     */
    type?: number;

    /**
     * The type label.
     */
    typeLabel?: string;
}
