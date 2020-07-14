export interface ICurrencyState {
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
    currentPriceEUR: number;

    /**
     * The market cap in EUR.
     */
    marketCapEUR: number;

    /**
     * The volume in the last 24H in EUR.
     */
    volumeEUR: number;

    /**
     * Exchange rates based on EUR.
     */
    exchangeRatesEUR: { [id: string]: number };
}
