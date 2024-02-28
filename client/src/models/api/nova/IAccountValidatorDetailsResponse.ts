import { ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface IAccountValidatorDetailsResponse extends IResponse {
    /**
     * The account validator response.
     */
    validatorDetails?: ValidatorResponse;
}
