import { SlotCommitment } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface ISlotResponse extends IResponse {
    /**
     * The deserialized slot.
     */
    slot?: SlotCommitment;
}
