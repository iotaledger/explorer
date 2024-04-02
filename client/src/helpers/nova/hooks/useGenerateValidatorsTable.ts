import type { ITableRow } from "~/app/components/Table";
import { TableCellType, type TTableData } from "~/app/components/nova/TableCell";
import { BaseTokenResponse } from "@iota/sdk-wasm-nova/web";
import { ValidatorsTableHeadings } from "~/app/lib/ui/enums/ValidatorsTableHeadings.enum";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import { useNetworkInfoNova } from "../networkInfo";
import { IValidator } from "~/models/api/nova/IValidatorsResponse";

function getValidatorTableRow(
    network: string,
    tokenInfo: BaseTokenResponse,
    manaInfo: BaseTokenResponse,
    validator: IValidator,
    rank: number,
): ITableRow<TTableData> {
    const data: TTableData[] = [];
    const validatorResponse = validator.validator;
    const address = validatorResponse.address;
    const inCommittee = validator.inCommittee;
    const delegatedStake = validatorResponse.poolStake - validatorResponse.validatorStake;
    const stake = `${formatAmount(validatorResponse.validatorStake, tokenInfo)}/${formatAmount(delegatedStake, tokenInfo)}`;
    Object.values(ValidatorsTableHeadings).forEach((heading) => {
        let tableData: TTableData | null = null;

        switch (heading) {
            case ValidatorsTableHeadings.Address:
                tableData = {
                    type: TableCellType.TruncatedId,
                    data: address,
                    href: `/${network}/addr/${address}`,
                };
                break;
            case ValidatorsTableHeadings.Candidate:
                tableData = {
                    type: TableCellType.Text,
                    data: (!inCommittee).toString(),
                };
                break;
            case ValidatorsTableHeadings.Elected:
                tableData = {
                    type: TableCellType.Text,
                    data: inCommittee.toString(),
                };
                break;
            case ValidatorsTableHeadings.FixedCost:
                tableData = {
                    type: TableCellType.Text,
                    data: formatAmount(validatorResponse.fixedCost, manaInfo),
                };
                break;
            case ValidatorsTableHeadings.Stake:
                tableData = {
                    type: TableCellType.Text,
                    data: stake,
                };
                break;
            case ValidatorsTableHeadings.PoolStake:
                tableData = {
                    type: TableCellType.Text,
                    data: formatAmount(validatorResponse.poolStake, tokenInfo),
                };
                break;
            case ValidatorsTableHeadings.RankedByStake:
                tableData = {
                    type: TableCellType.Text,
                    data: String(rank),
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
        id: validatorResponse.address,
        data,
    };
}

export function useGenerateValidatorsTable(validators: IValidator[]): ITableRow<TTableData>[] {
    const { name: network, tokenInfo, manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const rows: ITableRow<TTableData>[] = [];

    validators?.map((validator, idx) => {
        const rank = idx + 1;
        const row = getValidatorTableRow(network, tokenInfo, manaInfo, validator, rank);
        rows.push(row);
    });

    return rows;
}
