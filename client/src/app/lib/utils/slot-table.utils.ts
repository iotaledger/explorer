import { ITableRow } from "~/app/components/Table";
import { SlotTableData, TSlotTableCell } from "~/app/components/nova/landing/SlotTableCell";
import { SlotStatus } from "../enums";
import { ISlotCommitmentWrapper } from "~/models/api/nova/ILatestSlotCommitmentsResponse";
import { Utils } from "@iota/sdk-wasm-nova/web";

export function getTableRows(
    currentSlotIndex: number | null,
    latestSlotIndexes: number[] | null,
    latestSlotCommitments: ISlotCommitmentWrapper[],
    network: string,
): ITableRow<TSlotTableCell>[] {
    const rows: ITableRow<TSlotTableCell>[] = [];

    if (currentSlotIndex !== null) {
        const id = currentSlotIndex.toString();
        rows.push({
            id,
            data: [
                {
                    data: currentSlotIndex.toString(),
                    type: SlotTableData.Text,
                },
                {
                    type: SlotTableData.Empty,
                },
                {
                    type: SlotTableData.Empty,
                },
                {
                    type: SlotTableData.Empty,
                },
                {
                    type: SlotTableData.Empty,
                },
                {
                    type: SlotTableData.Empty,
                },
                {
                    data: SlotStatus.Pending,
                    type: SlotTableData.StatusPill,
                },
                {
                    data: "0.2s",
                    type: SlotTableData.Text,
                },
            ],
        });
    }

    if (latestSlotIndexes && latestSlotIndexes.length > 0 && latestSlotCommitments && latestSlotCommitments.length > 0) {
        latestSlotIndexes.forEach((slotIndex, idx) => {
            const slotCommitment = latestSlotCommitments[idx];
            const index = slotIndex.toString();
            const slotCommitmentId = Utils.computeSlotCommitmentId(slotCommitment.slotCommitment);
            const referenceManaCost = slotCommitment.slotCommitment.referenceManaCost.toString();
            const blocks = "2000";
            const transactions = "2000";
            const burnedMana = "200000";
            const slotStatus = slotCommitment.status;
            const fromTo = "12/08/19";

            rows.push({
                id: index.toString(),
                data: [
                    {
                        data: index,
                        type: SlotTableData.Link,
                        href: `${network}/slot/${slotIndex}`,
                    },
                    {
                        data: slotCommitmentId,
                        type: SlotTableData.TruncatedId,
                        href: `${network}/slot/${slotIndex}`,
                    },
                    {
                        data: referenceManaCost,
                        type: SlotTableData.Text,
                    },
                    {
                        data: blocks,
                        type: SlotTableData.Link,
                        href: `${network}/slot/${slotIndex}?tab=RefBlocks`,
                    },
                    {
                        data: transactions,
                        type: SlotTableData.Text,
                    },
                    {
                        data: burnedMana,
                        type: SlotTableData.Text,
                    },
                    {
                        data: slotStatus,
                        type: SlotTableData.StatusPill,
                    },
                    {
                        data: fromTo,
                        type: SlotTableData.Text,
                    },
                ],
            });
        });
    }

    return rows;
}
