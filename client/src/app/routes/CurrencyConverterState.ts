import { CurrencyState } from "../components/CurrencyState";

export interface CurrencyConverterState extends CurrencyState {
    /**
     * The fiat amount.
     */
    fiat: string;

    /**
     * The currency iota value input.
     */
    currencyIota: string;

    /**
     * The currency kiota value input.
     */
    currencyKiota: string;

    /**
     * The currency miota value input.
     */
    currencyMiota: string;

    /**
     * The currency giota value input.
     */
    currencyGiota: string;

    /**
     * The currency tiota value input.
     */
    currencyTiota: string;

    /**
     * The currency piota value input.
     */
    currencyPiota: string;
}
