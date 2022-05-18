import { CurrencyState } from "./CurrencyState";

export interface FiatSelectorState extends CurrencyState {
    /**
     * The dropdown expanded flag.
     */
    isExpanded: boolean;
    /**
     * The map of currency names.
     */
    currencyNames: { [id: string]: string };
}

