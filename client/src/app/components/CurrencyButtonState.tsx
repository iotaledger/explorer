import { CurrencyState } from "./CurrencyState";

export interface CurrencyButtonState extends CurrencyState{
    /**
     * The value formatted as currency.
     */
    valueCurrency: string;

    /**
     * The value formatted as currency.
     */
    priceCurrency: string;
}
