import { ValidatorResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IValidator {
    validator: ValidatorResponse;
    inCommittee: boolean;
}

export interface IValidatorsResponse extends IResponse {
    validators?: IValidator[];
}
