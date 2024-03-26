import { ISlotCommitmentWrapper, SlotCommitmentStatus } from "~/models/api/nova/ILatestSlotCommitmentsResponse";
import type { ITableRow } from "~/app/components/Table";
import { SlotTableCellType, type TSlotTableData } from "~/app/components/nova/landing/SlotTableCell";
import { SlotStatus } from "~app/lib/enums";
import { SlotTableHeadings } from "~/app/lib/ui/enums";
import { Utils } from "@iota/sdk-wasm-nova/web";
import useSlotsFeed from "./useSlotsFeed";
import { useNovaTimeConvert } from "./useNovaTimeConvert";
import moment from "moment";

type SlotTimeRange = {
    from: number;
    to: number;
} | null;

function getSlotIndexTableCell(slotIndex: number, slotTimeRange: SlotTimeRange): TSlotTableData {
    if (!slotTimeRange) {
        return {
            type: SlotTableCellType.Empty,
        };
    }

    const remainingTime = slotTimeRange.to - moment().unix();
    const showLink = remainingTime <= 0;
    const slotIndexString = slotIndex.toString();

    if (showLink) {
        return {
            type: SlotTableCellType.Link,
            data: slotIndexString,
            href: `slot/${slotIndex}`,
        };
    }
    return {
        type: SlotTableCellType.Text,
        data: slotIndexString,
    };
}

function getFromToTableCell(slotTimeRange: SlotTimeRange): TSlotTableData {
    if (!slotTimeRange) {
        return {
            type: SlotTableCellType.Empty,
        };
    }

    const remainingTime = slotTimeRange.to - moment().unix();
    const fromTo = remainingTime <= 0 ? moment.unix(slotTimeRange.to).format("YYYY-MM-DD hh:mm:ss") : remainingTime + "s";

    return {
        type: SlotTableCellType.Text,
        data: fromTo,
    };
}

function getPendingSlotTableRow(slotIndex: number, slotTimeRange: SlotTimeRange): ITableRow<TSlotTableData> {
    const data: TSlotTableData[] = [];

    Object.values(SlotTableHeadings).forEach((heading) => {
        let tableData: TSlotTableData;

        switch (heading) {
            case SlotTableHeadings.Index:
                tableData = getSlotIndexTableCell(slotIndex, slotTimeRange);
                break;
            case SlotTableHeadings.Status:
                tableData = {
                    type: SlotTableCellType.StatusPill,
                    data: SlotStatus.Pending,
                };
                break;
            case SlotTableHeadings.FromTo:
                tableData = getFromToTableCell(slotTimeRange);
                break;
            default:
                tableData = {
                    type: SlotTableCellType.Empty,
                };
        }

        data.push(tableData);
    });

    return {
        id: slotIndex.toString(),
        data,
    };
}

function getSlotCommitmentTableRow(
    slotIndex: number,
    commitmentWrapper: ISlotCommitmentWrapper | null,
    slotTimeRange: SlotTimeRange,
): ITableRow<TSlotTableData> {
    const data: TSlotTableData[] = [];

    if (!commitmentWrapper) {
        return getPendingSlotTableRow(slotIndex, slotTimeRange);
    }

    const slotCommitmentId = Utils.computeSlotCommitmentId(commitmentWrapper.slotCommitment);
    const referenceManaCost = commitmentWrapper.slotCommitment.referenceManaCost.toString();
    const blocks = "2000";
    const transactions = "2000";
    const slotStatus = commitmentWrapper.status;

    Object.values(SlotTableHeadings).forEach((heading) => {
        let tableData: TSlotTableData;

        switch (heading) {
            case SlotTableHeadings.Index:
                tableData = getSlotIndexTableCell(slotIndex, slotTimeRange);
                break;
            case SlotTableHeadings.Id:
                tableData = {
                    type: SlotTableCellType.TruncatedId,
                    data: slotCommitmentId,
                    href: `slot/${slotIndex}`,
                };
                break;
            case SlotTableHeadings.ReferenceManaCost:
                tableData = {
                    type: SlotTableCellType.Text,
                    data: referenceManaCost,
                };
                break;
            case SlotTableHeadings.Blocks:
                tableData = {
                    type: SlotTableCellType.Link,
                    data: blocks,
                    href: `slot/${slotIndex}?tab=RefBlocks`,
                };
                break;
            case SlotTableHeadings.Txs:
                tableData = {
                    type: SlotTableCellType.Link,
                    data: transactions,
                    href: `slot/${slotIndex}?tab=Txs`,
                };
                break;
            case SlotTableHeadings.BurnedMana:
                tableData = {
                    type: SlotTableCellType.BurnedMana,
                    shouldLoad: slotStatus === SlotCommitmentStatus.Finalized,
                    data: slotIndex.toString(),
                };
                break;
            case SlotTableHeadings.Status:
                tableData = {
                    type: SlotTableCellType.StatusPill,
                    data: slotStatus,
                };
                break;
            case SlotTableHeadings.FromTo:
                tableData = getFromToTableCell(slotTimeRange);
                break;
        }

        data.push(tableData);
    });

    return {
        id: commitmentWrapper.slotCommitment.slot.toString(),
        data,
    };
}

export function useGenerateSlotsTable(): ITableRow<TSlotTableData>[] {
    const { slotIndexToUnixTimeRange } = useNovaTimeConvert();
    const { currentSlotIndex, currentSlotTimeRange, latestSlotCommitments, latestSlotIndexes } = useSlotsFeed();

    const rows: ITableRow<TSlotTableData>[] = [];

    if (currentSlotIndex !== null) {
        const currentSlotRow = getPendingSlotTableRow(currentSlotIndex, currentSlotTimeRange);
        rows.push(currentSlotRow);
    }

    if (latestSlotCommitments && latestSlotCommitments.length > 0) {
        latestSlotIndexes?.map((slotIndex) => {
            const commitmentWrapper = latestSlotCommitments?.find((commitment) => commitment.slotCommitment.slot === slotIndex) ?? null;
            const slotTimeRange = slotIndexToUnixTimeRange?.(slotIndex) ?? null;
            const row = getSlotCommitmentTableRow(slotIndex, commitmentWrapper, slotTimeRange);
            rows.push(row);
        });
    }

    return rows;
}
