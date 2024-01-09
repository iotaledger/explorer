import { ICoinStats } from "../api/ICurrenciesResponse";

export interface ICurrencySettings {
  /**
   * The code for the currently selected fiat currency.
   */
  fiatCode: string;

  /**
   * The time the last currency update happened.
   */
  lastCurrencyUpdate?: number;

  /**
   * The supported currencies exchange rates from EUR base.
   */
  fiatExchangeRatesEur?: {
    id: string;
    rate: number;
  }[];

  /**
   * Market stats of supported coins (in EUR).
   */
  coinStats?: {
    [coinCode: string]: ICoinStats;
  };
}
