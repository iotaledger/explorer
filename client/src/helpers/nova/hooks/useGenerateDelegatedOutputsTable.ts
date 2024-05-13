import type { ITableRow } from "~/app/components/Table";
import { TableCellType, type TTableData } from "~/app/components/nova/TableCell";
import { BaseTokenResponse, OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { useNetworkInfoNova } from "../networkInfo";
import { DelegationOutputsTableHeadings } from "~/app/lib/ui/enums/DelegationOutputsTableHeadings.enum";

function getDelegationOutputTableRow(
    network: string,
    output: OutputWithMetadataResponse,
    tokenInfo: BaseTokenResponse,
): ITableRow<TTableData> {
    const data: TTableData[] = [];
    const outputId = output.metadata.outputId;

    Object.values(DelegationOutputsTableHeadings).forEach((heading) => {
        let tableData: TTableData | null = null;

        switch (heading) {
            case DelegationOutputsTableHeadings.OutputId:
                tableData = {
                    type: TableCellType.TruncatedId,
                    data: outputId,
                    href: `/${network}/output/${outputId}`,
                    shouldCopy: true,
                };
                break;
            case DelegationOutputsTableHeadings.Amount:
                tableData = {
                    type: TableCellType.Formatted,
                    data: output.output.amount,
                    tokenInfo,
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

export function useGenerateDelegatedOutputsTable(delegationOutputs: OutputWithMetadataResponse[]): ITableRow<TTableData>[] {
    const { name: network, tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const rows: ITableRow<TTableData>[] = [];

    delegationOutputs?.map((output) => {
        const row = getDelegationOutputTableRow(network, output, tokenInfo);
        rows.push(row);
    });

    return rows;
}
