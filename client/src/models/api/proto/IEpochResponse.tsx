import { IResponse } from "../IResponse";

export interface IEpochResponse extends IResponse {
    index: number;
    commitment: string;
    confirmed: boolean;
    timestamp: number;
    commitmentRoot: string;
    tangleRoot: string;
    stateRoot: string;
    previousRoot: string;
    nextRoot: string;
    stateMutationRoot: string;
    manaRoot: string;
    numAcceptedBlocks: number;
    numActiveValidators: number;
    numAcceptedTxs: number;
    cumulativeStake: number;
}
