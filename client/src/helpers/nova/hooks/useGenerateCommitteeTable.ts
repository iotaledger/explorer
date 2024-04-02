import type { ITableRow } from "~/app/components/Table";
import { TableCellType, type TTableData } from "~/app/components/nova/TableCell";
import { BaseTokenResponse, CommitteeMember, ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import { CommitteeTableHeadings } from "~/app/lib/ui/enums/CommitteeTableHeadings.enum";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";

function getCommitteeTableRow(
    network: string,
    tokenInfo: BaseTokenResponse,
    manaInfo: BaseTokenResponse,
    validator: ValidatorResponse | CommitteeMember,
): ITableRow<TTableData> {
    const data: TTableData[] = [];

    Object.values(CommitteeTableHeadings).forEach((heading) => {
        let tableData: TTableData | null = null;

        switch (heading) {
            case CommitteeTableHeadings.Address:
                tableData = {
                    type: TableCellType.TruncatedId,
                    data: validator.address,
                    href: `/${network}/addr/${validator.address}`,
                };
                break;
            case CommitteeTableHeadings.Cost:
                tableData = {
                    type: TableCellType.Text,
                    data: formatAmount(validator.fixedCost, manaInfo),
                };
                break;
            case CommitteeTableHeadings.PoolStake:
                tableData = {
                    type: TableCellType.Text,
                    data: formatAmount(validator.poolStake, tokenInfo),
                };
                break;
            case CommitteeTableHeadings.ValidatorStake:
                tableData = {
                    type: TableCellType.Text,
                    data: formatAmount(validator.validatorStake, tokenInfo),
                };
                break;
            case CommitteeTableHeadings.DelegatedStake:
                tableData = {
                    type: TableCellType.Text,
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
): ITableRow<TTableData>[] {
    const rows: ITableRow<TTableData>[] = [];

    validators?.map((validator) => {
        const row = getCommitteeTableRow(network, tokenInfo, manaInfo, validator);
        rows.push(row);
    });

    return rows;
}
