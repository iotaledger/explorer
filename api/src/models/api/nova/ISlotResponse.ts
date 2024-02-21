// eslint-disable-next-line import/no-unresolved
import { SlotCommitment } from "@iota/sdk-nova";

export interface ISlotResponse {
    /**
     * The deserialized slot.
     */
    slot?: SlotCommitment;
}
