export default interface ITokenDetails {
    /**
     * Token name.
     */
    name: string;
    /**
     * Token symbol.
     */
    symbol?: string;
    /**
     * Token held amount.
     */
    amount: number;
    /**
     * Token price.
     */
    price?: number;
    /**
     * Token total value held.
     */
    value?: number;
}

