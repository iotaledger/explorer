import { SlotCommitment } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface ILatestSlotCommitmentResponse extends IResponse {
    slotCommitments: SlotCommitment[];
}
