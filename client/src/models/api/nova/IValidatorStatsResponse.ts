import { IResponse } from "./IResponse";

export interface IValidatorStatsResponse extends IResponse {
    /**
     * The number of validators
     */
    validatorsSize?: number;
    /**
     * The number of active validators (committee).
     */
    activeValidatorsSize?: number;
    /**
     * The total amount staked and delegated validators (BigInt).
     */
    totalPoolStake?: string;
    /**
     * The total amount staked by validators (BigInt).
     */
    totalValidatorStake?: string;
    /**
     * The total amount staked and delegated by active validator set (committee) (BigInt).
     */
    totalActivePoolStake?: string;
    /**
     * The total amount staked by active validator set (committee) (BigInt).
     */
    totalActiveValidatorStake?: string;
}
