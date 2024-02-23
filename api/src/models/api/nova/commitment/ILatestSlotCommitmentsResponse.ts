import { SlotCommitment } from "@iota/sdk-nova";
import { IResponse } from "../../IResponse";

export interface ILatestSlotCommitmentResponse extends IResponse {
    slotCommitments: SlotCommitment[];
}
