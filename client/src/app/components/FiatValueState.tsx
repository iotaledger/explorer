import { CurrencyState } from "./CurrencyState";

export interface FiatValueState extends CurrencyState {
    /**
     * The value formatted as currency.
     */
    valueCurrency: string;
}
