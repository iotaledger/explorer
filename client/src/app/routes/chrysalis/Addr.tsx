/* eslint-disable max-len */
/* eslint-disable camelcase */
import { TRANSACTION_PAYLOAD_TYPE, UnitsHelper } from "@iota/iota.js";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/transactionsHelper";
import { NetworkService } from "../../../services/networkService";
import { SettingsService } from "../../../services/settingsService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Bech32Address from "../../components/chrysalis/Bech32Address";
import QR from "../../components/chrysalis/QR";
import FiatValue from "../../components/FiatValue";
import Icon from "../../components/Icon";
import { ModalIcon } from "../../components/ModalProps";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import messageJSON from "./../../../assets/modals/message.json";
import Transaction from "./../../components/chrysalis/Transaction";
import Modal from "./../../components/Modal";
import "./Addr.scss";
import { AddrRouteProps } from "./AddrRouteProps";
import { AddrState, FilterValue } from "./AddrState";

/**
 * Component which will show the address page.
 */
class Addr extends AsyncComponent<RouteComponentProps<AddrRouteProps>, AddrState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of Addr.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddrRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._bechHrp = networkConfig?.bechHrp ?? "iot";

        this.state = {
            ...Bech32AddressHelper.buildAddress(
                this._bechHrp,
                props.match.params.address
            ),
            formatFull: false,
            statusBusy: true,
            status: "Loading transactions...",
            filterValue: FilterValue.All,
            received: 0,
            sent: 0,
            currentPage: 1,
            pageSize: 10,
            currentPageTransactions: []
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.address);
        if (result?.address) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                address: result.address,
                bech32AddressDetails: Bech32AddressHelper.buildAddress(
                    this._bechHrp,
                    result.address.address,
                    result.address.addressType
                ),
                balance: result.address.balance,
                outputIds: result.addressOutputIds,
                historicOutputIds: result.historicAddressOutputIds
            }, async () => {
                await this.getTransactionHistory();
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.address}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="addr">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>
                                    Address
                                </h1>
                                <Modal icon={ModalIcon.Dots} data={messageJSON} />
                            </div>
                        </div>
                        <div className="top">
                            <div className="sections">
                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>
                                                General
                                            </h2>
                                            <Modal icon={ModalIcon.Info} data={messageJSON} />
                                        </div>
                                    </div>
                                    <div className="row space-between general-content">
                                        <div className="section--data">
                                            <Bech32Address
                                                addressDetails={this.state.bech32AddressDetails}
                                                advancedMode={true}
                                            />
                                            {!this.state.statusBusy && (
                                                <div className="row row--tablet-responsive">
                                                    <div className="section--data margin-r-m">
                                                        <div className="label">
                                                            Total received
                                                        </div>
                                                        <div className="value">
                                                            {UnitsHelper.formatBest(
                                                                (this.state.balance ?? 0) + this.state.sent
                                                            )}
                                                            {" "}(
                                                            <FiatValue
                                                                value={
                                                                    (this.state.balance ?? 0) +
                                                                    this.state.sent
                                                                }
                                                            />)
                                                        </div>
                                                    </div>
                                                    <div className="section--data">
                                                        <div className="label">
                                                            Total sent
                                                        </div>
                                                        <div className="value">
                                                            {this.state.statusBusy ? (<Spinner />)
                                                                : (
                                                                    <React.Fragment>
                                                                        {UnitsHelper.formatBest(this.state.sent)}
                                                                        {" "}(<FiatValue value={this.state.sent} />)
                                                                    </React.Fragment>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {this.state.balance !== undefined && (
                                                <div className="row middle">
                                                    <Icon icon="wallet" boxed />
                                                    <div className="balance">
                                                        <div className="label">
                                                            Final balance
                                                        </div>
                                                        <div className="value featured">
                                                            {this.state.balance > 0 ? (
                                                                <React.Fragment>
                                                                    {UnitsHelper.formatBest(this.state.balance)}
                                                                    {" "}
                                                                    <span>(</span>
                                                                    <FiatValue value={this.state.balance} />
                                                                    <span>)</span>
                                                                </React.Fragment>
                                                            ) : 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {this.state.status && (
                                                <div className="margin-t-s middle row">
                                                    {this.state.statusBusy && (<Spinner />)}
                                                    <p className="status">
                                                        {this.state.status}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="section--data">
                                            {this.state.bech32AddressDetails?.bech32 &&
                                                (
                                                    //  eslint-disable-next-line react/jsx-pascal-case
                                                    <QR data={this.state.bech32AddressDetails.bech32} />
                                                )}
                                        </div>
                                    </div>

                                </div>
                                {this.state.outputs && this.state.outputs.length === 0 && (
                                    <div className="section">
                                        <div className="section--data">
                                            <p>
                                                There are no transactions for this address.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {(this.state.transactionHistory?.transactionHistory?.transactions?.length ?? -1 > 0) && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="row middle">
                                                <h2>
                                                    Transaction History
                                                </h2>
                                                <Modal icon={ModalIcon.Info} data={messageJSON} />
                                            </div>
                                            <div>
                                                <div className="transactions-filter">
                                                    {this.filterButton(FilterValue.All)}
                                                    {this.filterButton(FilterValue.Incoming)}
                                                    {this.filterButton(FilterValue.Outgoing)}
                                                </div>
                                            </div>

                                        </div>
                                        <table className="transaction--table">
                                            <thead>
                                                <tr>
                                                    <th>Message id</th>
                                                    <th>Date</th>
                                                    <th>Inputs</th>
                                                    <th>Outputs</th>
                                                    <th>Status</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { this.currentPageTransactions.map(transaction =>
                                                    (
                                                        <React.Fragment key={transaction?.messageId}>
                                                            <Transaction
                                                                key={transaction?.messageId}
                                                                messageId={transaction?.messageId}
                                                                network={this.props.match.params.network}
                                                                inputs={transaction?.inputs.length}
                                                                outputs={transaction?.outputs.length}
                                                                messageTangleStatus={transaction?.messageTangleStatus}
                                                                date={transaction?.date}
                                                                amount={transaction?.amount}
                                                                tableFormat={true}
                                                            />
                                                            {transaction?.relatedSpentTransaction && this.hasPassedFilterCriteria(this.state.filterValue, transaction?.relatedSpentTransaction.amount) && (
                                                                <Transaction
                                                                    key={transaction?.relatedSpentTransaction.messageId}
                                                                    messageId={transaction?.relatedSpentTransaction.messageId}
                                                                    network={this.props.match.params.network}
                                                                    inputs={transaction?.relatedSpentTransaction.inputs.length}
                                                                    outputs={transaction?.relatedSpentTransaction.outputs.length}
                                                                    messageTangleStatus={transaction?.relatedSpentTransaction.messageTangleStatus}
                                                                    date={transaction?.relatedSpentTransaction.date}
                                                                    amount={transaction?.relatedSpentTransaction.amount}
                                                                    tableFormat={true}
                                                                />
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                            </tbody>
                                        </table>

                                        {/* Only visible in mobile -- Card transactions*/}
                                        <div className="transaction-cards">
                                            {this.currentPageTransactions.map(transaction =>
                                                (
                                                    <React.Fragment key={transaction?.messageId}>
                                                        <Transaction
                                                            key={transaction?.messageId}
                                                            messageId={transaction?.messageId}
                                                            network={this.props.match.params.network}
                                                            inputs={transaction?.inputs.length}
                                                            outputs={transaction?.outputs.length}
                                                            messageTangleStatus={transaction?.messageTangleStatus}
                                                            date={transaction?.date}
                                                            amount={transaction?.amount}
                                                        />

                                                        {transaction?.relatedSpentTransaction &&
                                                            this.hasPassedFilterCriteria(this.state.filterValue, transaction?.relatedSpentTransaction.amount) && (
                                                                <Transaction
                                                                    key={transaction?.relatedSpentTransaction.messageId}
                                                                    messageId={transaction?.relatedSpentTransaction.messageId}
                                                                    network={this.props.match.params.network}
                                                                    inputs={transaction?.relatedSpentTransaction.inputs.length}
                                                                    outputs={transaction?.relatedSpentTransaction.outputs.length}
                                                                    messageTangleStatus={transaction?.relatedSpentTransaction.messageTangleStatus}
                                                                    date={transaction?.relatedSpentTransaction.date}
                                                                    amount={transaction?.relatedSpentTransaction.amount}
                                                                />
                                                            )}
                                                    </React.Fragment>
                                                ))}
                                        </div>
                                        <Pagination
                                            currentPage={this.state.currentPage}
                                            totalCount={this.filteredTransactions.length}
                                            pageSize={this.state.pageSize}
                                            siblingsCount={1}
                                            onPageChange={page =>
                                                    this.setState({ currentPage: page },
                                                        () => {
                                                            const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
                                                            // Check if its last page
                                                            const lastPageIndex = (this.state.currentPage === Math.ceil(this.filteredTransactions.length / this.state.pageSize)) ? this.filteredTransactions.length : firstPageIndex + this.state.pageSize;
                                                            this.updateTransactionHistoryDetails(firstPageIndex, lastPageIndex)
                                                            .catch(err => console.error(err));
                                                    })}
                                        />
                                    </div>)}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }

    private get currentPageTransactions() {
        const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
        const lastPageIndex = firstPageIndex + this.state.pageSize;

        return this.filteredTransactions.slice(firstPageIndex, lastPageIndex);
    }

    private get filteredTransactions() {
        const transactions = [...this.state.transactionHistory?.transactionHistory?.transactions ?? []];
        return transactions.filter(transaction => this.hasPassedFilterCriteria(this.state.filterValue, transaction.amount));
    }

    private async getTransactionHistory() {
        console.log("getTransactionHistory");
        // Transactions (permanode)
        // Fetch fist page
        const transactionsDetails = await this._tangleCacheService.transactionsDetails({
            network: this.props.match.params.network,
            address: this.state.address?.address ?? "",
            query: { page_size: this.state.pageSize }
        }, false);

        this.setState({ transactionHistory: transactionsDetails },
            async () => {
                // Update transaction details for first page
                const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
                const lastPageIndex = firstPageIndex + this.state.pageSize;
                this.updateTransactionHistoryDetails(firstPageIndex, lastPageIndex)
                .catch(err => console.error(err));

                // Fetch all transaction history
                const allTransactionsDetails = await this._tangleCacheService.transactionsDetails({
                    network: this.props.match.params.network,
                    address: this.state.address?.address ?? "",
                    query: { page_size: 6000, state: transactionsDetails?.transactionHistory.state }
                }, true);

                this.setState({ transactionHistory: allTransactionsDetails },
                    async () => {
                        // Update all transaction history details
                        if (allTransactionsDetails?.transactionHistory.transactions) {
                            this.updateTransactionHistoryDetails(this.state.pageSize, allTransactionsDetails?.transactionHistory.transactions?.length)
                            .then(() => {
                                this.setState({
                                    status: "",
                                    statusBusy: false
                                });
                            })
                            .catch(err => console.error(err));
                        }
                    });
            }
        );
    }

    private async updateTransactionHistoryDetails(startIndex: number, endIndex: number) {
        const transactions = [...this.state.transactionHistory?.transactionHistory?.transactions ?? []];

        if (transactions.length > 0) {
            const transactionIds = transactions.map(transaction => transaction.messageId);

            for (let i = startIndex; i < endIndex; i++) {
                let isUpdated = false;
                // get date and tangle status
                if (!transactions[i].date || !transactions[i].messageTangleStatus) {
                    isUpdated = true;
                    const { date, messageTangleStatus } = await TransactionsHelper
                        .getMessageStatus(this.props.match.params.network, transactions[i].messageId,
                            this._tangleCacheService);
                    transactions[i].date = date;
                    transactions[i].messageTangleStatus = messageTangleStatus;
                }

                // get transaction amount
                if (!transactions[i].amount) {
                    isUpdated = true;
                    const amount = await this.getTransactionAmount(transactions[i].messageId);
                    transactions[i].amount = amount;

                    if (amount < 0) {
                        this.setState({ sent: this.state.sent + Math.abs(amount) });
                    }
                }

                if (transactions[i].isSpent === undefined) {
                    isUpdated = true;
                    let isTransactionSpent = false;

                    // Get spent related transaction
                    for (const output of transactions[i].outputs) {
                        if (output.output.address.address === this.state.address?.address && output.spendingMessageId && !transactionIds?.includes(output.spendingMessageId)) {
                            transactionIds?.push(output.spendingMessageId);
                            const transactionsResult = await this._tangleCacheService.search(
                                this.props.match.params.network, output.spendingMessageId);
                            const statusDetails = await TransactionsHelper
                                .getMessageStatus(this.props.match.params.network, output.spendingMessageId,
                                    this._tangleCacheService);

                            if (transactionsResult?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                                const relatedAmount = await this.getTransactionAmount(output.spendingMessageId);
                                transactions[i].relatedSpentTransaction = {
                                    messageId: output.spendingMessageId,
                                    date: statusDetails.date,
                                    messageTangleStatus: statusDetails.messageTangleStatus,
                                    isSpent: true,
                                    amount: relatedAmount,
                                    inputs: transactionsResult?.message?.payload?.essence?.inputs,
                                    outputs: transactionsResult?.message?.payload?.essence?.outputs
                                };
                                if (relatedAmount < 0) {
                                    this.setState({ sent: this.state.sent + Math.abs(relatedAmount) });
                                }
                                isTransactionSpent = true;
                            }
                        }
                    }
                    transactions[i].isSpent = isTransactionSpent;
                }

                if (isUpdated) {
                    this.setState({ transactionHistory: { transactionHistory: { transactions } } });
                }
            }
        }
    }

    private async getTransactionAmount(
        messageId: string): Promise<number> {
        const result = await this._tangleCacheService.search(
            this.props.match.params.network, messageId);
        const { inputs, outputs } =
            await TransactionsHelper.getInputsAndOutputs(result?.message,
                this.props.match.params.network,
                this._bechHrp,
                this._tangleCacheService);
        const inputsRelated = inputs.filter(input => input.transactionAddress.hex === this.state.address?.address);
        const outputsRelated = outputs.filter(output => output.address.hex === this.state.address?.address);
        let fromAmount = 0;
        let toAmount = 0;
        for (const input of inputsRelated) {
            fromAmount += input.amount;
        }
        for (const output of outputsRelated) {
            toAmount += output.amount;
        }
        return toAmount - fromAmount;
    }

    private hasPassedFilterCriteria(type: FilterValue, transactionAmount: number = 0): boolean {
        return type === FilterValue.Incoming ? transactionAmount > 0 : (type === FilterValue.Outgoing ? transactionAmount < 0 : true);
    }

    private filterButton(type: FilterValue): ReactNode {
        const disabled = this.state.transactionHistory?.transactionHistory?.transactions?.find(t => (
            this.hasPassedFilterCriteria(type, t.amount) || this.hasPassedFilterCriteria(type, t.relatedSpentTransaction?.amount)
        )) === undefined;
        return (
            <button
                className={classNames(
                    { active: this.state.filterValue === type }
                )}
                type="button"
                onClick={() => {
                    this.setState({ filterValue: type, currentPage: 1 });
                }}
                disabled={disabled}
            >
                {type}
            </button>
        );
    }
}

export default Addr;
