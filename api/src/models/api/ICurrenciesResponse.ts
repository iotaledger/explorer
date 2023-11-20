import { ICoinStats } from "../db/ICurrencyState";
import { IResponse } from "./IResponse";
import { ISignedResponse } from "./ISignedResponse";

export interface ICurrenciesResponse extends IResponse, ISignedResponse {
    /**
     * The supported currencies exchange rates from EUR base.
     */
    fiatExchangeRatesEur?: { [id: string]: number };

    /**
     * Market stats of supported coins (in EUR).
     */
    coinStats: {
        [coinCode: string]: ICoinStats;
    };
}

