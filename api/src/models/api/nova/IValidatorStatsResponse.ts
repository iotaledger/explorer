import { IResponse } from "./IResponse";

export interface IValidatorStatsResponse extends IResponse {
    /**
     * The total number of validators.
     */
    totalValidators?: number;
    /**
     * The number of validators in the committee.
     */
    committeeValidators?: number;
    /**
     * The total amount staked and delegated in validators (BigInt).
     */
    totalValidatorsPoolStake?: string;
    /**
     * The total amount staked by validators (BigInt).
     */
    totalValidatorsStake?: string;
    /**
     * The total amount staked and delegated in committee (BigInt).
     */
    committeeValidatorsPoolStake?: string;
    /**
     * The total amount staked by committee (BigInt).
     */
    totalCommitteeStake?: string;
}
