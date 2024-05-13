import { SlotCommitment } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface ISlotResponse extends IResponse {
    slot: SlotCommitment;
}
