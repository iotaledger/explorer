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
     * Exchange rates based on EUR.
     */
    exchangeRatesEUR: { [id: string]: number };
}
