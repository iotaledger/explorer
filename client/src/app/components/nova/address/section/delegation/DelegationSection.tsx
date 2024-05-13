import React, { useEffect, useState } from "react";
import Pagination from "~/app/components/Pagination";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import "./DelegationSection.scss";
import { IDelegationWithDetails } from "~/models/api/nova/IDelegationWithDetails";
import { CardInfo, CardInfoProps } from "~/app/components/CardInfo";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import { DelegationsTableHeadings } from "~/app/lib/ui/enums/DelegationsTableHeadings.enum";
import { useGenerateDelegationsTable } from "~/helpers/nova/hooks/useGenerateDelegationsTable";
import TableCellWrapper, { TTableData } from "../../../TableCell";
import Table, { ITableRow } from "~/app/components/Table";

interface DelegationSectionProps {
    readonly delegationDetails: IDelegationWithDetails[] | null;
}

const PAGE_SIZE: number = 10;

const DelegationSection: React.FC<DelegationSectionProps> = ({ delegationDetails }) => {
    const { tokenInfo, manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [isFormatBalance, setIsFormatBalance] = useState<boolean>(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [currentPage, setCurrentPage] = useState<IDelegationWithDetails[]>([]);
    const tableData: ITableRow<TTableData>[] = useGenerateDelegationsTable(currentPage ?? []);
    const tableHeadings = Object.values(DelegationsTableHeadings);

    const totalAmount = delegationDetails?.reduce((acc, delegation) => acc + BigInt(delegation.output?.output?.amount ?? 0), BigInt(0));
    const totalRewards = delegationDetails?.reduce(
        (acc, delegation) => acc + BigInt(delegation.rewards?.manaRewards?.rewards ?? 0),
        BigInt(0),
    );

    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (delegationDetails) {
            setCurrentPage(delegationDetails.slice(from, to));
        }
    }, [delegationDetails, pageNumber]);

    if (delegationDetails === null) {
        return null;
    }

    const delegationData: CardInfoProps[] = [
        {
            title: "Total amount:",
            value: formatAmount(totalAmount ?? 0, tokenInfo, isFormatBalance),
            onClickValue: () => setIsFormatBalance(!isFormatBalance),
            copyValue: String(totalAmount),
        },
        {
            title: "Total rewards",
            value: formatAmount(totalRewards ?? 0, manaInfo, isFormatBalance),
            onClickValue: () => setIsFormatBalance(!isFormatBalance),
            copyValue: String(totalRewards),
        },
    ];
    return (
        <div className="section section--delegations">
            <div className="card-info-wrapper">
                {delegationData.map((data, index) => {
                    return (
                        <CardInfo
                            key={index}
                            title={data.title}
                            value={data.value}
                            onClickValue={data.onClickValue}
                            copyValue={data.copyValue}
                        />
                    );
                })}
            </div>

            <div className="section--data delegation-outputs">
                <Table headings={tableHeadings} data={tableData} TableDataComponent={TableCellWrapper} />
            </div>

            <Pagination
                currentPage={pageNumber}
                totalCount={delegationDetails?.length ?? 0}
                pageSize={PAGE_SIZE}
                siblingsCount={1}
                onPageChange={(number) => setPageNumber(number)}
            />
        </div>
    );
};

export default DelegationSection;
