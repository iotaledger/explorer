export interface ITokenMetadata {
    /**
     * The IRC standard of the token metadata
     */
    standard: "IRC30";
    /**
     * The human-readable name of the native token
     */
    name: string;
    /**
     * The human-readable description of the token
     */
    description?: string;
    /**
     * The symbol/ticker of the token
     */
    symbol: string;
    /**
     * Number of decimals the token uses (divide the token amount by decimals to get its user representation)
     */
    decimals: number;
    /**
     * URL pointing to more resources about the token
     */
    url?: string;
    /**
     * URL pointing to an image resource of the token logo
     */
    logoUrl?: string;
    /**
     * The logo of the token encoded as a byte string
     */
    logo?: string;
}
