import { ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface IValidator {
    validator: ValidatorResponse;
    inCommittee: boolean;
}

export interface IValidatorsResponse extends IResponse {
    validators?: IValidator[];
}
