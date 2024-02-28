import { ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface IValidatorsResponse extends IResponse {
    validators?: ValidatorResponse[];
}
