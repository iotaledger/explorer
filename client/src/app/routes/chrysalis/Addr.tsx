import { ISigLockedDustAllowanceOutput, ISigLockedSingleOutput, IUTXOInput, TRANSACTION_PAYLOAD_TYPE, UnitsHelper } from "@iota/iota.js";
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
                                            <div className="section--data">
                                                <div className="label">
                                                    Total received
                                                </div>
                                                <div className="value">
                                                    {this.state.statusBusy ? (<Spinner />)
                                                        : (
                                                            <React.Fragment>
                                                                {UnitsHelper.formatBest(this.state.received)}
                                                                {" "}(<FiatValue value={this.state.received} />)
                                                            </React.Fragment>
                                                        )}
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

                                            {this.state.balance !== undefined && this.state.balance === 0 && (
                                                <div className="section--data">
                                                    <div className="label">
                                                        Final balance
                                                    </div>
                                                    <div className="value">
                                                        0
                                                    </div>
                                                </div>
                                            )}
                                            {this.state.balance !== undefined && this.state.balance !== 0 && (
                                                <div className="section--data">
                                                    <div className="label">
                                                        Final balance
                                                    </div>
                                                    <div className="value">
                                                        {UnitsHelper.formatBest(this.state.balance)}
                                                        {" "}(<FiatValue value={this.state.balance} />)
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

                                {this.state.transactionHistory && (
                                    <div className="section transaction--section">
                                        <div className="section--header section--header__space-between">
                                            <div className="row middle">
                                                <h2>
                                                    Transaction History
                                                </h2>
                                                <Modal icon={ModalIcon.Info} data={messageJSON} />
                                            </div>
                                            <div className="messages-tangle-state">
                                                <div className="transactions-filter">
                                                    <button
                                                        className="filter-buttons"
                                                        type="button"
                                                        onClick={() => {
                                                            this.setState({ filterValue: "all" });
                                                        }}
                                                    >
                                                        All
                                                    </button>
                                                    <button
                                                        className="filter-buttons middle"
                                                        type="button"
                                                        onClick={() => {
                                                            this.setState({ filterValue: "incoming" });
                                                        }}
                                                    >
                                                        Incoming
                                                    </button>
                                                    <button
                                                        className="filter-buttons"
                                                        type="button"
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
                                                <th>[DEV]: is_spent</th>
                                            </tr>
                                            {this.state.transactionHistory
                                                ?.transactionHistory
                                                ?.transactions
                                                ?.map(transaction =>
                                                (
                                                    <Transaction
                                                        key={transaction?.messageId}
                                                        messageId={transaction?.messageId}
                                                        network={this.props.match.params.network}
                                                        inputs={transaction?.inputs.length}
                                                        outputs={transaction?.outputs.length}
                                                        messageTangleStatus={transaction?.messageTangleStatus}
                                                        date={transaction?.date}
                                                        isSpent={transaction?.isSpent}
                                                        amount={-1}
                                                    />
                                                ))}

                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }


    private async getTransactionHistory() {
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
                            transaction.relatedSpentTransaction = {
                                messageId: output.spendingMessageId,
                                date: statusDetails.date,
                                messageTangleStatus: statusDetails.messageTangleStatus,
                                isSpent: true,
                                inputs: transactionsResult?.message?.payload?.essence?.inputs,
                                outputs: transactionsResult?.message?.payload?.essence?.outputs
                            };
                            isTransactionSpent = true;
                        }
                    }
                }
                transaction.isSpent = isTransactionSpent;
                this.setState({
                    transactionHistory: transactionsDetails,
                    status: `Loading transactions [${i}/${transactionsDetails.transactionHistory.transactions.length}]`
                });
            }
        }
        this.setState({
            status: "",
            statusBusy: false
        });
    }

    // Add logic
    private async getTransactionAmount(
        inputs: IUTXOInput[],
        outputs: (ISigLockedSingleOutput | ISigLockedDustAllowanceOutput)[]): Promise<number> {
        return 0;
    }
}

export default Addr;
