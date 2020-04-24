export interface IState {
    /**
     * The id for the state.
     */
    id: string;

    /**
     * The time of the last currency update.
     */
    lastCurrencyUpdate: number;

    /**
     * The coin market cap currency EUR rate.
     */
    coinMarketCapRateEUR: number;

    /**
     * The market cap in EUR.
     */
    marketCapEur: number;

    /**
     * The volume in the last 24H.
     */
    volume24h: number;

    /**
     * The percentage change in the last 24H.
     */
    percentageChange24h: number;

    /**
     * Exchange rates based on EUR.
     */
    exchangeRatesEUR: { [id: string]: number };
}
