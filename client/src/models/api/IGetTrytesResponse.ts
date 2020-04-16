import { ConfirmationState } from "./confirmationState";
import { IResponse } from "./IResponse";

export interface IGetTrytesResponse extends IResponse {
    /**
     * The trytes for the requested transactions.
     */
    trytes?: string[];

    /**
     * The confirmation state of the transactions.
     */
    confirmationStates?: ConfirmationState[];
}
