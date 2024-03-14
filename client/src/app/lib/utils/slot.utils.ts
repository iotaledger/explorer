import { ISlotCommitmentWrapper, SlotCommitmentStatus } from "~/models/api/nova/ILatestSlotCommitmentsResponse";
import { SlotStatus } from "../enums";
import { SLOT_COMMITMENT_STATUS_TO_SLOT_STATUS } from "../constants/slot.constants";

export function parseSlotIndexFromParams(slotIndex: string): number | undefined {
    const slotIndexNum = parseInt(slotIndex, 10);
    if (isNaN(slotIndexNum)) {
        return;
    }
    return slotIndexNum;
}

export function getSlotStatusFromLatestSlotCommitments(
    slotIndex: number | undefined,
    latestSlotCommitments: ISlotCommitmentWrapper[],
): SlotStatus {
    let slotStatus: SlotStatus = SlotStatus.Pending;

    if (slotIndex === undefined) {
        return slotStatus;
    }

    const newestSlot = latestSlotCommitments[0];
    const oldestSlot = latestSlotCommitments[latestSlotCommitments.length - 1];

    if (!newestSlot || slotIndex > newestSlot.slotCommitment.slot) {
        return slotStatus;
    }

    if (slotIndex < oldestSlot.slotCommitment.slot) {
        // If searched slot is less than the oldest slot, infer status based on the oldest slot's status
        return oldestSlot.status === SlotCommitmentStatus.Finalized ? SlotStatus.Finalized : SlotStatus.Committed;
    }

    for (const { slotCommitment, status } of latestSlotCommitments) {
        if (slotCommitment.slot >= slotIndex) {
            if (status === SlotCommitmentStatus.Finalized) {
                slotStatus = SLOT_COMMITMENT_STATUS_TO_SLOT_STATUS[status];
                break;
            }
        } else {
            break;
        }
    }

    return slotStatus;
}
