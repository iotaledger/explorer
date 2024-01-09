/**
 * The market stats for a currency.
 */
export interface ICoinStats {
    /**
     * The time of the last update.
     */
    lastUpdate: number;
    /**
     * The price of the crypto coin in EUR.
     */
    price: number;
    /**
     * The coin market cap in EUR.
     */
    marketCap: number;
    /**
     * The volume in the last 24H in EUR.
     */
    volume24h: number;
}

export interface ICurrencyState {
    /**
     * The id for the state.
     */
    id: string;

    /**
     * The time of the last fx update.
     */
    lastFixerUpdate: number;

    /**
     * Fiat exchange rates (EUR relative).
     */
    fiatExchangeRatesEur: { [id: string]: number };

    /**
     * Market stats of supported coins (in EUR).
     */
    coinStats?: {
        [coinCode: string]: ICoinStats;
    };
}
