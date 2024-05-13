import { ISlotCommitmentWrapper, SlotCommitmentStatus } from "~/models/api/nova/ILatestSlotCommitmentsResponse";
import type { ITableRow } from "~/app/components/Table";
import { TableCellType, type TTableData } from "~/app/components/nova/TableCell";
import { SlotStatus } from "~app/lib/enums";
import { SlotTableHeadings } from "~/app/lib/ui/enums";
import { BaseTokenResponse, Utils } from "@iota/sdk-wasm-nova/web";
import useSlotsFeed from "./useSlotsFeed";
import { useNovaTimeConvert } from "./useNovaTimeConvert";
import { useNetworkInfoNova } from "../networkInfo";
import moment from "moment";

type SlotTimeRange = {
    from: number;
    to: number;
} | null;

function getSlotIndexTableCell(network: string, slotIndex: number, slotTimeRange: SlotTimeRange): TTableData {
    if (!slotTimeRange) {
        return {
            type: TableCellType.Empty,
        };
    }

    const remainingTime = slotTimeRange.to - moment().unix();
    const showLink = remainingTime <= 0;
    const slotIndexString = slotIndex.toString();

    if (showLink) {
        return {
            type: TableCellType.Link,
            data: slotIndexString,
            href: `/${network}/slot/${slotIndex}`,
        };
    }
    return {
        type: TableCellType.Text,
        data: slotIndexString,
    };
}

function getSlotTimestampTableCell(slotTimeRange: SlotTimeRange): TTableData {
    if (!slotTimeRange) {
        return {
            type: TableCellType.Empty,
        };
    }

    const remainingTime = slotTimeRange.to - moment().unix();
    const slotTimestamp = remainingTime <= 0 ? moment.unix(slotTimeRange.to).format("YYYY-MM-DD hh:mm:ss") : remainingTime + "s";

    return {
        type: TableCellType.Text,
        data: slotTimestamp,
    };
}

function getPendingSlotTableRow(network: string, slotIndex: number, slotTimeRange: SlotTimeRange): ITableRow<TTableData> {
    const data: TTableData[] = [];

    Object.values(SlotTableHeadings).forEach((heading) => {
        let tableData: TTableData;

        switch (heading) {
            case SlotTableHeadings.Index:
                tableData = getSlotIndexTableCell(network, slotIndex, slotTimeRange);
                break;
            case SlotTableHeadings.Status:
                tableData = {
                    type: TableCellType.StatusPill,
                    data: SlotStatus.Pending,
                };
                break;
            case SlotTableHeadings.Timestamp:
                tableData = getSlotTimestampTableCell(slotTimeRange);
                break;
            default:
                tableData = {
                    type: TableCellType.Empty,
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
    network: string,
    slotIndex: number,
    commitmentWrapper: ISlotCommitmentWrapper | null,
    slotTimeRange: SlotTimeRange,
    tokenInfo: BaseTokenResponse,
): ITableRow<TTableData> {
    const data: TTableData[] = [];

    if (!commitmentWrapper) {
        return getPendingSlotTableRow(network, slotIndex, slotTimeRange);
    }

    const slotCommitmentId = Utils.computeSlotCommitmentId(commitmentWrapper.slotCommitment);
    const referenceManaCost = commitmentWrapper.slotCommitment.referenceManaCost.toString();
    const slotStatus = commitmentWrapper.status;

    Object.values(SlotTableHeadings).forEach((heading) => {
        let tableData: TTableData;

        switch (heading) {
            case SlotTableHeadings.Index:
                tableData = getSlotIndexTableCell(network, slotIndex, slotTimeRange);
                break;
            case SlotTableHeadings.Id:
                tableData = {
                    type: TableCellType.TruncatedId,
                    data: slotCommitmentId,
                    href: `/${network}/slot/${slotIndex}`,
                };
                break;
            case SlotTableHeadings.ReferenceManaCost:
                tableData = {
                    type: TableCellType.Formatted,
                    data: referenceManaCost,
                    tokenInfo,
                    isFormatted: true,
                };
                break;
            case SlotTableHeadings.Blocks:
                tableData = {
                    type: TableCellType.Stats,
                    data: slotIndex.toString(),
                    href: `/${network}/slot/${slotIndex}`,
                    statsType: "blocks",
                    shouldLoad: slotStatus === SlotCommitmentStatus.Finalized,
                };
                break;
            case SlotTableHeadings.Txs:
                tableData = {
                    type: TableCellType.Stats,
                    data: slotIndex.toString(),
                    href: `/${network}/slot/${slotIndex}`,
                    statsType: "transactions",
                    shouldLoad: slotStatus === SlotCommitmentStatus.Finalized,
                };
                break;
            case SlotTableHeadings.BurnedMana:
                tableData = {
                    type: TableCellType.BurnedMana,
                    shouldLoad: slotStatus === SlotCommitmentStatus.Finalized,
                    data: slotIndex.toString(),
                };
                break;
            case SlotTableHeadings.Status:
                tableData = {
                    type: TableCellType.StatusPill,
                    data: slotStatus,
                };
                break;
            case SlotTableHeadings.Timestamp:
                tableData = getSlotTimestampTableCell(slotTimeRange);
                break;
        }

        data.push(tableData);
    });

    return {
        id: commitmentWrapper.slotCommitment.slot.toString(),
        data,
    };
}

export function useGenerateSlotsTable(): ITableRow<TTableData>[] {
    const { name: network, manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { slotIndexToUnixTimeRange } = useNovaTimeConvert();
    const { currentSlotIndex, currentSlotTimeRange, latestSlotCommitments, latestSlotIndexes } = useSlotsFeed();

    const rows: ITableRow<TTableData>[] = [];

    if (currentSlotIndex !== null) {
        const currentSlotRow = getPendingSlotTableRow(network, currentSlotIndex, currentSlotTimeRange);
        rows.push(currentSlotRow);
    }

    if (latestSlotCommitments && latestSlotCommitments.length > 0) {
        latestSlotIndexes?.map((slotIndex) => {
            const commitmentWrapper = latestSlotCommitments?.find((commitment) => commitment.slotCommitment.slot === slotIndex) ?? null;
            const slotTimeRange = slotIndexToUnixTimeRange?.(slotIndex) ?? null;
            const row = getSlotCommitmentTableRow(network, slotIndex, commitmentWrapper, slotTimeRange, manaInfo);
            rows.push(row);
        });
    }

    return rows;
}
