
export interface ICurrencySettings  {
    /**
     * The fiat code for currency conversion.
     */
    fiatCode: string;

    /**
     * The time the last currency update happened.
     */
    lastCurrencyUpdate?: number;

    /**
     * The base currency for exchange rates.
     */
    baseCurrencyRate?: number;

    /**
     * The currencies used for conversion.
     */
    currencies?: {
        /**
         * Id of the currency.
         */
        id: string;
        /**
         * The rate.
         */
        rate: number;
    }[];
}
