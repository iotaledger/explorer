import { IResponse } from "./IResponse";
import { ISignedResponse } from "./ISignedResponse";

export interface ICurrencyNamesResponse extends IResponse, ISignedResponse {
    /**
     * The currency acronym to name map.
     */
    currencyNames?: { [id: string]: string };
}
