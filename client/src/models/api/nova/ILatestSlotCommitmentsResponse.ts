import { SlotCommitment } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export enum SlotCommitmentStatus {
    Committed = "committed",
    Finalized = "finalized",
}

export interface ISlotCommitmentWrapper {
    status: SlotCommitmentStatus;
    slotCommitment: SlotCommitment;
}

export interface ILatestSlotCommitmentResponse extends IResponse {
    slotCommitments: ISlotCommitmentWrapper[];
}
