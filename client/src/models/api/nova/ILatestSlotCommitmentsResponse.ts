import { SlotCommitment } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

enum SlotCommitmentStatus {
    COMMITTED = "committed",
    FINALIZED = "finalized",
}

export interface ISlotCommitmentWrapper {
    status: SlotCommitmentStatus;
    slotCommitment: SlotCommitment;
}

export interface ILatestSlotCommitmentResponse extends IResponse {
    slotCommitments: ISlotCommitmentWrapper[];
}
