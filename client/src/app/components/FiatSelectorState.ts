import { CurrencyState } from "./CurrencyState";

export interface FiatSelectorState extends CurrencyState {
  /**
   * The dropdown expanded flag.
   */
  isExpanded: boolean;
}
