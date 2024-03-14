import { SlotCommitmentStatus } from "~/models/api/nova/ILatestSlotCommitmentsResponse";
import { SlotStatus } from "../enums";
import { PillStatus } from "../ui/enums";

export const SLOT_COMMITMENT_STATUS_TO_SLOT_STATUS: Record<SlotCommitmentStatus, SlotStatus> = {
    [SlotCommitmentStatus.Committed]: SlotStatus.Committed,
    [SlotCommitmentStatus.Finalized]: SlotStatus.Finalized,
};

export const SLOT_STATUS_TO_PILL_STATUS: Record<SlotStatus, PillStatus> = {
    [SlotStatus.Pending]: PillStatus.Pending,
    [SlotStatus.Committed]: PillStatus.Success,
    [SlotStatus.Finalized]: PillStatus.Success,
};
