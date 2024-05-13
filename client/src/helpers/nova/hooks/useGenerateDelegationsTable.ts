import type { ITableRow } from "~/app/components/Table";
import { TableCellType, type TTableData } from "~/app/components/nova/TableCell";
import { BaseTokenResponse, DelegationOutput, Utils } from "@iota/sdk-wasm-nova/web";
import { useNetworkInfoNova } from "../networkInfo";
import { DelegationsTableHeadings } from "~/app/lib/ui/enums/DelegationsTableHeadings.enum";
import { IDelegationWithDetails } from "~/models/api/nova/IDelegationWithDetails";

function getDelegationTableRow(
    network: string,
    bech32Hrp: string,
    delegation: IDelegationWithDetails,
    tokenInfo: BaseTokenResponse,
    manaInfo: BaseTokenResponse,
): ITableRow<TTableData> {
    const data: TTableData[] = [];
    const outputId = delegation.output.metadata.outputId;
    const validatorAddress = Utils.addressToBech32((delegation.output?.output as DelegationOutput).validatorAddress, bech32Hrp);
    const amount = delegation.output.output.amount;
    const rewards = delegation.rewards?.manaRewards?.rewards ?? 0;

    Object.values(DelegationsTableHeadings).forEach((heading) => {
        let tableData: TTableData | null = null;

        switch (heading) {
            case DelegationsTableHeadings.OutputId:
                tableData = {
                    type: TableCellType.TruncatedId,
                    data: outputId,
                    href: `/${network}/output/${outputId}`,
                    shouldCopy: true,
                };
                break;
            case DelegationsTableHeadings.ValidatorAddress:
                tableData = {
                    type: TableCellType.TruncatedId,
                    data: validatorAddress,
                    href: `/${network}/addr/${validatorAddress}`,
                    shouldCopy: true,
                };
                break;
            case DelegationsTableHeadings.Amount:
                tableData = {
                    type: TableCellType.Formatted,
                    data: amount,
                    tokenInfo,
                };
                break;
            case DelegationsTableHeadings.Rewards:
                tableData = {
                    type: TableCellType.Formatted,
                    data: rewards,
                    tokenInfo: manaInfo,
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
        id: outputId,
        data,
    };
}

export function useGenerateDelegationsTable(delegations: IDelegationWithDetails[]): ITableRow<TTableData>[] {
    const { name: network, bech32Hrp, tokenInfo, manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const rows: ITableRow<TTableData>[] = [];

    delegations?.map((delegation) => {
        const row = getDelegationTableRow(network, bech32Hrp, delegation, tokenInfo, manaInfo);
        rows.push(row);
    });

    return rows;
}
