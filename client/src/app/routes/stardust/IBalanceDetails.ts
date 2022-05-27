export default interface IBalanceDetails {
    /**
     * Asset name.
     */
    asset: string;
    /**
     * Asset symbol.
     */
    symbol?: string;
    /**
     * Asset qquantity.
     */
    quantity: number;
    /**
     * Asset price.
     */
    price?: number;
    /**
     * Asset total value held.
     */
    value?: number;
}

