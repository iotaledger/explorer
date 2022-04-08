export interface ISymbolsResponse {
    /**
     * Was the request a success.
     */
    success: boolean;
    /**
     * The currency names.
     */
    symbols: { symbol: string };
}
