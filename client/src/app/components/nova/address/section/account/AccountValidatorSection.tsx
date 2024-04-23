import { OutputWithMetadataResponse, ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import React, { useState } from "react";
import { CardInfo, CardInfoProps } from "~/app/components/CardInfo";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import "./AccountValidatorSection.scss";
import Table, { ITableRow } from "~/app/components/Table";
import TableCellWrapper, { TTableData } from "../../../TableCell";
import { DelegationOutputsTableHeadings } from "~/app/lib/ui/enums/DelegationOutputsTableHeadings.enum";
import { useGenerateDelegatedOutputsTable } from "~/helpers/nova/hooks/useGenerateDelegatedOutputsTable";

interface AccountValidatorSectionProps {
    readonly validatorDetails: ValidatorResponse | null;
    readonly validatorDelegationOutputs: OutputWithMetadataResponse[] | null;
}

const AccountValidatorSection: React.FC<AccountValidatorSectionProps> = ({ validatorDetails, validatorDelegationOutputs }) => {
    const [isFormatBalance, setIsFormatBalance] = useState<boolean>(false);
    const [formatManaValuesFull, setFormatManaValuesFull] = useState<boolean>(false);
    const { tokenInfo, manaInfo } = useNetworkInfoNova((state) => state.networkInfo);
    const tableData: ITableRow<TTableData>[] = useGenerateDelegatedOutputsTable(validatorDelegationOutputs ?? []);
    const tableHeadings = Object.values(DelegationOutputsTableHeadings);

    if (!validatorDetails) {
        return null;
    }

    const delegatedStake = BigInt(validatorDetails.poolStake) - BigInt(validatorDetails.validatorStake);
    const validationData: CardInfoProps[] = [
        { title: "Active", value: validatorDetails.active ? "Yes" : "No" },
        { title: "Staking End Epoch", value: validatorDetails.stakingEndEpoch },
        {
            title: "Total pool stake:",
            value: formatAmount(validatorDetails.poolStake, tokenInfo, isFormatBalance),
            onClickValue: () => setIsFormatBalance(!isFormatBalance),
            copyValue: String(validatorDetails.poolStake),
        },
        {
            title: "Total validator stake",
            value: formatAmount(validatorDetails?.validatorStake ?? 0, tokenInfo, isFormatBalance),
            onClickValue: () => setIsFormatBalance(!isFormatBalance),
            copyValue: String(validatorDetails?.validatorStake),
        },
        {
            title: "Total delegated stake",
            value: formatAmount(delegatedStake, tokenInfo, isFormatBalance),
            onClickValue: () => setIsFormatBalance(!isFormatBalance),
            copyValue: String(delegatedStake),
        },
        {
            title: "Fixed cost",
            value: formatAmount(validatorDetails?.fixedCost, manaInfo, formatManaValuesFull),
            onClickValue: () => setFormatManaValuesFull(!formatManaValuesFull),
            copyValue: String(validatorDetails?.fixedCost),
        },
        { title: "Latest Supported Protocol Version", value: validatorDetails.latestSupportedProtocolVersion },
    ];

    return (
        <div className="section section--account-validator">
            <div className="card-info-wrapper">
                {validationData.map((data, index) => {
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
        </div>
    );
};

export default AccountValidatorSection;
