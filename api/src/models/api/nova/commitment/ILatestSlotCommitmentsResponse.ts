/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SlotCommitment } from "@iota/sdk-nova";
import { IResponse } from "../../IResponse";

export enum SlotCommitmentStatus {
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
