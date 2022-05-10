/**
 * The base token info of the network.
 */
export interface IBaseTokenInfo {
    /**
     * The base token name.
     */
    name: string;
    /**
     * The base token ticker symbol.
     */
    tickerSymbol: string;
    /**
     * The base token unit.
     */
    unit: string;
    /**
     * The base token sub-unit.
     */
    subunit?: string;
    /**
     * The base token decimals.
     */
    decimals: number;
    /**
     * The use metric prefix flag.
     */
    useMetricPrefix: boolean;
}
