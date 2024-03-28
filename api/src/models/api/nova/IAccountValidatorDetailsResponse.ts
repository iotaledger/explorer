import { ValidatorResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IAccountValidatorDetailsResponse extends IResponse {
    /**
     * The account validator response.
     */
    validatorDetails?: ValidatorResponse;
}
