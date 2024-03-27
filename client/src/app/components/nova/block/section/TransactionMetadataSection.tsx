import {
    TRANSACTION_FAILURE_REASON_STRINGS,
    Transaction,
    TransactionMetadataResponse as TransactionMetadata,
    TransactionState,
    Utils,
    AccountAddress,
    BaseTokenResponse,
} from "@iota/sdk-wasm-nova/web";
import React from "react";
import Spinner from "../../../Spinner";
import ContextInputView from "../../ContextInputView";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { PillStatus } from "~/app/lib/ui/enums";
import StatusPill from "~/app/components/nova/StatusPill";
import Table, { ITableRow } from "~/app/components/Table";
import AllotmentsTableCellWrapper, { AllotmentTableCellType, TAllotmentsTableData } from "./AllotmentsTableCell";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import "./TransactionMetadataSection.scss";

interface TransactionMetadataSectionProps {
    readonly transaction?: Transaction;
    readonly transactionMetadata?: TransactionMetadata;
    readonly metadataError?: string;
}

const TRANSACTION_STATE_TO_PILL_STATUS: Record<TransactionState, PillStatus> = {
    pending: PillStatus.Pending,
    accepted: PillStatus.Success,
    committed: PillStatus.Success,
    finalized: PillStatus.Success,
    failed: PillStatus.Error,
};

enum AllotmentsTableHeadings {
    address = "Address",
    amount = "Amount",
}

const TransactionMetadataSection: React.FC<TransactionMetadataSectionProps> = ({ transaction, transactionMetadata, metadataError }) => {
    const { name: network, manaInfo, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const pillStatus: PillStatus | undefined = TRANSACTION_STATE_TO_PILL_STATUS[transactionMetadata?.transactionState ?? "pending"];
    const tableHeadings = Object.values(AllotmentsTableHeadings);
    const tableData: ITableRow<TAllotmentsTableData>[] = transaction
        ? generateAllotmentsTable(transaction, network, manaInfo, bech32Hrp)
        : [];

    return (
        <div className="section metadata-section">
            <div className="section--data">
                {!transactionMetadata && !metadataError && <Spinner />}
                {metadataError ? (
                    <p className="danger">Failed to retrieve metadata. {metadataError}</p>
                ) : (
                    <React.Fragment>
                        {transactionMetadata && (
                            <>
                                <div className="section--data">
                                    <div className="label">Transaction Status</div>
                                    <div className="value row middle">
                                        <StatusPill status={pillStatus} label={transactionMetadata.transactionState} />
                                    </div>
                                </div>
                                {transactionMetadata.transactionFailureReason && (
                                    <div className="section--data">
                                        <div className="label">Failure Reason</div>
                                        <div className="value">
                                            {TRANSACTION_FAILURE_REASON_STRINGS[transactionMetadata.transactionFailureReason]}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {transaction && (
                            <>
                                <div className="section--data">
                                    <div className="label">Transaction Creation Slot</div>
                                    <div className="value code">{transaction.creationSlot}</div>
                                </div>
                                {transaction?.contextInputs?.map((contextInput, idx) => (
                                    <ContextInputView contextInput={contextInput} key={idx} />
                                ))}
                                {transaction?.allotments && (
                                    <div className="section--data">
                                        <div className="label">Mana Allotments</div>
                                        <div className="value allotments__table">
                                            <Table
                                                headings={tableHeadings}
                                                data={tableData}
                                                TableDataComponent={AllotmentsTableCellWrapper}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

export function generateAllotmentsTable(
    transaction: Transaction,
    network: string,
    manaInfo: BaseTokenResponse,
    bech32Hrp: string,
): ITableRow<TAllotmentsTableData>[] {
    const rows: ITableRow<TAllotmentsTableData>[] = [];

    transaction?.allotments?.map((allotment, idx) => {
        const data: TAllotmentsTableData[] = [];

        Object.values(AllotmentsTableHeadings).forEach((heading) => {
            let tableData: TAllotmentsTableData;

            switch (heading) {
                case AllotmentsTableHeadings.address: {
                    const accountAddress = new AccountAddress(allotment.accountId);
                    const accountBech32 = Utils.addressToBech32(accountAddress, bech32Hrp);
                    tableData = {
                        type: AllotmentTableCellType.TruncatedId,
                        data: allotment.accountId,
                        href: `${network}/addr/${accountBech32}`,
                    };
                    break;
                }
                case AllotmentsTableHeadings.amount: {
                    tableData = {
                        type: AllotmentTableCellType.Text,
                        data: formatAmount(allotment.mana, manaInfo, false),
                    };
                    break;
                }
            }

            data.push(tableData);
        });
        rows.push({ id: allotment.accountId, data });
    });

    return rows;
}

TransactionMetadataSection.defaultProps = {
    transactionMetadata: undefined,
    transaction: undefined,
    metadataError: undefined,
};

export default TransactionMetadataSection;
