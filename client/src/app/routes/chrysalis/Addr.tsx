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
import { ModalIcon } from "../../components/ModalProps";
import Spinner from "../../components/Spinner";
import messageJSON from "./../../../assets/modals/message.json";
import Transaction from "./../../components/chrysalis/Transaction";
import Modal from "./../../components/Modal";
import "./Addr.scss";
import { AddrRouteProps } from "./AddrRouteProps";
import { AddrState } from "./AddrState";

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
            filterValue: "all",
            received: 0,
            sent: 0
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
                                            <div className="row">
                                                <div className="section--data margin-r-m">
                                                    <div className="label">
                                                        Total received
                                                    </div>
                                                    <div className="value">
                                                        {this.state.statusBusy ? (<Spinner />)
                                                            : (
                                                                <React.Fragment>
                                                                    {UnitsHelper.formatBest(
                                                                        (this.state.balance ?? 0) - this.state.sent
                                                                    )}
                                                                    {" "}(
                                                                    <FiatValue
                                                                        value={
                                                                            (this.state.balance ?? 0) -
                                                                            this.state.sent
                                                                        }
                                                                    />)
                                                                </React.Fragment>
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="section--data margin-l-m">
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


                                            {this.state.balance !== undefined && this.state.balance === 0 && (
                                                <div className="section--data">
                                                    <div className="label">
                                                        Final balance
                                                    </div>
                                                    <div className="value featured">
                                                        0
                                                    </div>
                                                </div>
                                            )}
                                            {this.state.balance !== undefined && this.state.balance !== 0 && (
                                                <div className="section--data">
                                                    <div className="label">
                                                        Final balance
                                                    </div>
                                                    <div className="value featured">
                                                        {UnitsHelper.formatBest(this.state.balance)}
                                                        {" "}
                                                        <span>(</span>
                                                        <FiatValue value={this.state.balance} />
                                                        <span>)</span>
                                                    </div>
                                                </div>
                                            )}


                                            {this.state.status && (
                                                <div className="middle row">
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

                                {((this.state.transactions && this.state.transactions.length > 0) ||
                                    (this.state.transactionHistory?.transactionHistory.transactions &&
                                        this.state.transactionHistory?.transactionHistory.transactions.length > 0)) && (
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
                                                        <button
                                                            className={classNames(
                                                                { active: this.state.filterValue === "all" }
                                                            )}
                                                            type="button"
                                                            onClick={() => {
                                                                this.setState({ filterValue: "all" });
                                                            }}
                                                        >
                                                            All
                                                        </button>
                                                        <button
                                                            className={classNames(
                                                                { active: this.state.filterValue === "incoming" }
                                                            )} type="button"
                                                            onClick={() => {
                                                                this.setState({ filterValue: "incoming" });
                                                            }}
                                                        >
                                                            Incoming
                                                        </button>
                                                        <button
                                                            className={classNames(
                                                                { active: this.state.filterValue === "outgoing" }
                                                            )} type="button"
                                                            onClick={() => {
                                                                this.setState({ filterValue: "outgoing" });
                                                            }}
                                                        >
                                                            Outgoing
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                            <table className="transaction--table">
                                                <tr>
                                                    <th>Message id</th>
                                                    <th>Date</th>
                                                    <th>Inputs</th>
                                                    <th>Outputs</th>
                                                    <th>Status</th>
                                                    <th>Amount</th>
                                                    {/* <th>[DEV]: is_spent</th> */}
                                                </tr>
                                                {/* Standard Transactions */}
                                                {this.state.transactions
                                                    ?.filter(transaction => {
                                                        if (this.state.filterValue === "all") {
                                                            return true;
                                                        }
                                                        if (this.state.filterValue === "incoming") {
                                                            return (transaction.amount ?? 0) > 0;
                                                        }
                                                        if (this.state.filterValue === "outgoing") {
                                                            return (transaction.amount ?? 0) < 0;
                                                        }
                                                        return true;
                                                    }).map(transaction =>
                                                    (
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
                                                    ))}
                                                {/* Historic Transactions */}
                                                {this.state.transactionHistory
                                                    ?.transactionHistory
                                                    ?.transactions
                                                    ?.filter(transaction => {
                                                        if (this.state.filterValue === "all") {
                                                            return true;
                                                        }
                                                        if (this.state.filterValue === "incoming") {
                                                            return (transaction.amount ?? 0) > 0;
                                                        }
                                                        if (this.state.filterValue === "outgoing") {
                                                            return (transaction.amount ?? 0) < 0;
                                                        }
                                                        return true;
                                                    }).map(transaction =>
                                                    (transaction.relatedSpentTransaction ? (
                                                        <React.Fragment>
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
                                                            <Transaction
                                                                key={transaction?.relatedSpentTransaction.messageId}
                                                                messageId={transaction
                                                                    ?.relatedSpentTransaction
                                                                    .messageId}
                                                                network={this.props.match.params.network}
                                                                inputs={transaction
                                                                    ?.relatedSpentTransaction.inputs.length}
                                                                outputs={transaction
                                                                    ?.relatedSpentTransaction.outputs.length}
                                                                messageTangleStatus={transaction
                                                                    ?.relatedSpentTransaction.messageTangleStatus}
                                                                date={transaction?.relatedSpentTransaction.date}
                                                                amount={transaction?.relatedSpentTransaction.amount}
                                                                tableFormat={true}
                                                            />
                                                        </React.Fragment>
                                                    ) : (
                                                        <Transaction
                                                            key={transaction?.messageId}
                                                            messageId={transaction?.messageId}
                                                            network={this.props.match.params.network}
                                                            inputs={transaction?.inputs.length}
                                                            outputs={transaction?.outputs.length}
                                                            messageTangleStatus={transaction?.messageTangleStatus}
                                                            date={transaction?.date}
                                                            isSpent={transaction?.isSpent}
                                                            amount={transaction?.amount}
                                                            tableFormat={true}
                                                        />
                                                    ))
                                                    )}
                                            </table>
                                            {/* Only visible in mobile -- Card transactions*/}
                                            <div className="transaction-cards">

                                                {/* Standard Transactions */}
                                                {this.state.transactions
                                                    ?.filter(transaction => {
                                                        if (this.state.filterValue === "all") {
                                                            return true;
                                                        }
                                                        if (this.state.filterValue === "incoming") {
                                                            return (transaction.amount ?? 0) > 0;
                                                        }
                                                        if (this.state.filterValue === "outgoing") {
                                                            return (transaction.amount ?? 0) < 0;
                                                        }
                                                        return true;
                                                    }).map(transaction =>
                                                    (
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
                                                    ))}
                                                {/* Historic Transactions */}
                                                {this.state.transactionHistory
                                                    ?.transactionHistory
                                                    ?.transactions
                                                    ?.filter(transaction => {
                                                        if (this.state.filterValue === "all") {
                                                            return true;
                                                        }
                                                        if (this.state.filterValue === "incoming") {
                                                            return (transaction.amount ?? 0) > 0;
                                                        }
                                                        if (this.state.filterValue === "outgoing") {
                                                            return (transaction.amount ?? 0) < 0;
                                                        }
                                                        return true;
                                                    }).map(transaction =>
                                                    (transaction.relatedSpentTransaction ? (
                                                        <React.Fragment>
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
                                                            <Transaction
                                                                key={transaction?.relatedSpentTransaction.messageId}
                                                                messageId={transaction
                                                                    ?.relatedSpentTransaction
                                                                    .messageId}
                                                                network={this.props.match.params.network}
                                                                inputs={transaction
                                                                    ?.relatedSpentTransaction.inputs.length}
                                                                outputs={transaction
                                                                    ?.relatedSpentTransaction.outputs.length}
                                                                messageTangleStatus={transaction
                                                                    ?.relatedSpentTransaction.messageTangleStatus}
                                                                date={transaction?.relatedSpentTransaction.date}
                                                                amount={transaction?.relatedSpentTransaction.amount}
                                                            />
                                                        </React.Fragment>
                                                    ) : (
                                                        <Transaction
                                                            key={transaction?.messageId}
                                                            messageId={transaction?.messageId}
                                                            network={this.props.match.params.network}
                                                            inputs={transaction?.inputs.length}
                                                            outputs={transaction?.outputs.length}
                                                            messageTangleStatus={transaction?.messageTangleStatus}
                                                            date={transaction?.date}
                                                            isSpent={transaction?.isSpent}
                                                            amount={transaction?.amount}
                                                        />
                                                    ))
                                                    )}
                                            </div>
                                        </div>)}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }

    private async getTransactions(): Promise<void> {
        if (this.state.outputIds) {
            const transactions = [];
            for (const outputId of this.state.outputIds) {
                const outputResult = await this._tangleCacheService.outputDetails(
                    this.props.match.params.network, outputId);

                if (outputResult) {
                    const messageResult = await this._tangleCacheService.search(
                        this.props.match.params.network, outputResult.messageId);
                    const { inputs, outputs } = await
                        TransactionsHelper.getInputsAndOutputs(messageResult?.message,
                            this.props.match.params.network, this._bechHrp, this._tangleCacheService);
                    const { date, messageTangleStatus } = await TransactionsHelper.getMessageStatus(
                        this.props.match.params.network, outputResult.messageId,
                        this._tangleCacheService);
                    const amount = await this.getTransactionAmount(outputResult.messageId);
                    transactions.push({
                        messageId: outputResult.messageId,
                        inputs,
                        outputs,
                        date,
                        messageTangleStatus,
                        amount
                    });
                    this.setState({
                        transactions,
                        status: `Loading transactions [${transactions.length}/${this.state.outputIds.length}]`
                    });
                }
                if (!this._isMounted) {
                    break;
                }
            }
        }
    }

    private async getTransactionHistory() {
        // Standard transactions (Hornet node)
        await this.getTransactions();

        // Historic transactions (permanode)
        const transactionsDetails = await this._tangleCacheService.transactionsDetails(
            this.props.match.params.network, this.state.address?.address ?? "");


        if (transactionsDetails?.transactionHistory.transactions) {
            let i = 0;
            for (const transaction of transactionsDetails.transactionHistory.transactions) {
                i++;

                // Get date and message tangle status
                const { date, messageTangleStatus } = await TransactionsHelper
                    .getMessageStatus(this.props.match.params.network, transaction.messageId,
                        this._tangleCacheService);
                transaction.date = date;
                transaction.messageTangleStatus = messageTangleStatus;
                const amount = await this.getTransactionAmount(transaction.messageId);
                transaction.amount = amount;

                if (amount < 0) {
                    this.setState({ sent: this.state.sent + Math.abs(transaction.amount) });
                }


                let isTransactionSpent = false;

                // Get spent related transaction
                for (const output of transaction.outputs) {
                    if (output.output.address.address === this.state.address?.address && output.spendingMessageId) {
                        const transactionsResult = await this._tangleCacheService.search(
                            this.props.match.params.network, output.spendingMessageId);
                        const statusDetails = await TransactionsHelper
                            .getMessageStatus(this.props.match.params.network, output.spendingMessageId,
                                this._tangleCacheService);

                        if (transactionsResult?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                            const totalAmount = await this.getTransactionAmount(output.spendingMessageId);
                            transaction.relatedSpentTransaction = {
                                messageId: output.spendingMessageId,
                                date: statusDetails.date,
                                messageTangleStatus: statusDetails.messageTangleStatus,
                                isSpent: true,
                                amount: totalAmount,
                                inputs: transactionsResult?.message?.payload?.essence?.inputs,
                                outputs: transactionsResult?.message?.payload?.essence?.outputs
                            };
                            if (amount < 0) {
                                this.setState({ sent: this.state.sent + Math.abs(transaction.amount) });
                            }
                            isTransactionSpent = true;
                        }
                    }
                }
                transaction.isSpent = isTransactionSpent;
                this.setState({
                    transactionHistory: transactionsDetails,
                    status: `Loading historic transactions 
                    [${i}/${transactionsDetails.transactionHistory.transactions.length}]`
                });
            }
        }
        this.setState({
            status: "",
            statusBusy: false
        });
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
}

export default Addr;
