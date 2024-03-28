import type { ITableRow } from "~/app/components/Table";
import { SlotTableCellType, type TSlotTableData } from "~/app/components/nova/landing/SlotTableCell";
import { BaseTokenResponse, CommitteeMember, ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import { CommitteeTableHeadings } from "~/app/lib/ui/enums/CommitteeTableHeadings.enum";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";

function getCommitteeTableRow(
    network: string,
    tokenInfo: BaseTokenResponse,
    manaInfo: BaseTokenResponse,
    validator: ValidatorResponse | CommitteeMember,
): ITableRow<TSlotTableData> {
    const data: TSlotTableData[] = [];

    Object.values(CommitteeTableHeadings).forEach((heading) => {
        let tableData: TSlotTableData | null = null;

        switch (heading) {
            case CommitteeTableHeadings.Address:
                tableData = {
                    type: SlotTableCellType.TruncatedId,
                    data: validator.address,
                    href: `/${network}/slot/${validator.address}`,
                };
                break;
            case CommitteeTableHeadings.Cost:
                tableData = {
                    type: SlotTableCellType.Text,
                    data: formatAmount(validator.fixedCost, manaInfo),
                };
                break;
            case CommitteeTableHeadings.PoolStake:
                tableData = {
                    type: SlotTableCellType.Text,
                    data: formatAmount(validator.poolStake, tokenInfo),
                };
                break;
            case CommitteeTableHeadings.ValidatorStake:
                tableData = {
                    type: SlotTableCellType.Text,
                    data: formatAmount(validator.validatorStake, tokenInfo),
                };
                break;
            case CommitteeTableHeadings.DelegatedStake:
                tableData = {
                    type: SlotTableCellType.Text,
                    data: formatAmount(BigInt(validator.poolStake) - BigInt(validator.validatorStake), tokenInfo),
                };
                break;
            default:
                break;
        }
        if (tableData) {
            data.push(tableData);
        }
    });

    return {
        id: validator.address,
        data,
    };
}

export function useGenerateCommitteeTable(
    validators: ValidatorResponse[] | CommitteeMember[],
    network: string,
    tokenInfo: BaseTokenResponse,
    manaInfo: BaseTokenResponse,
): ITableRow<TSlotTableData>[] {
    const rows: ITableRow<TSlotTableData>[] = [];

    validators?.map((validator, idx) => {
        const row = getCommitteeTableRow(network, tokenInfo, manaInfo, validator);
        rows.push(row);
    });

    return rows;
}
