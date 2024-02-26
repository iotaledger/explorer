/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ValidatorResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IValidatorsResponse extends IResponse {
    validators?: ValidatorResponse[];
}
