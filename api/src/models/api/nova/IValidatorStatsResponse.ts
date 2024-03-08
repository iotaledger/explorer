/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { IResponse } from "./IResponse";

export interface IValidatorStatsResponse extends IResponse {
    /**
     * totalPoolStake (BigInt)
     */
    totalPoolStake?: string;
    /**
     * totalValidatorStake (BigInt)
     */
    totalValidatorStake?: string;
}
