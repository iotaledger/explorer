/* eslint-disable max-len */
/* eslint-disable camelcase */
import { UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "./../../../assets/modals/chrysalis/address/main-header.json";
import transactionHistoryMessage from "./../../../assets/modals/chrysalis/address/transaction-history.json";
import Transaction from "./../../components/chrysalis/Transaction";
import Modal from "./../../components/Modal";
import { AddrState } from "./AddrState";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/chrysalis/bech32AddressHelper";
import { DateHelper } from "../../../helpers/dateHelper";
import { ITransactionHistoryItem, calculateTangleMessageStatus } from "../../../models/api/chrysalis/ITransactionHistoryResponse";
import { CHRYSALIS } from "../../../models/config/protocolVersion";
import { ChrysalisTangleCacheService } from "../../../services/chrysalis/chrysalisTangleCacheService";
import { NetworkService } from "../../../services/networkService";
import AsyncComponent from "../../components/AsyncComponent";
import Bech32Address from "../../components/chrysalis/Bech32Address";
import QR from "../../components/chrysalis/QR";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import Icon from "../../components/Icon";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import { AddressRouteProps } from "../AddressRouteProps";
import "./Addr.scss";

/**
 * Component which will show the address page for chrysalis and older.
 */
class Addr extends AsyncComponent<RouteComponentProps<AddressRouteProps>, AddrState> {
    /**
     * Maximum page size for permanode request.
     */
    private static readonly MAX_PAGE_SIZE: number = 500;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: ChrysalisTangleCacheService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of Addr.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddressRouteProps>) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._tangleCacheService = ServiceFactory.get<ChrysalisTangleCacheService>(`tangle-cache-${CHRYSALIS}`);

        this._bechHrp = networkConfig?.bechHrp ?? "iota";

        this.state = {
            ...Bech32AddressHelper.buildAddress(
                this._bechHrp,
                props.match.params.address
            ),
            formatFull: false,
            statusBusy: true,
            status: "Loading transactions...",
            received: 0,
            sent: 0,
            currentPage: 1,
            pageSize: 10,
            currentPageTransactions: [],
            isFormattedBalance: false
        };
    }

    private get currentPageTransactions() {
        const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
        const lastPageIndex = (this.state.currentPage === Math.ceil(this.txsHistory.length / this.state.pageSize)) ? this.txsHistory.length : firstPageIndex + this.state.pageSize;
        const transactionsPage = this.txsHistory.slice(firstPageIndex, lastPageIndex);

        const sortedTransactions: ITransactionHistoryItem[] = transactionsPage.sort((a, b) => (
            a.referencedByMilestoneIndex > b.referencedByMilestoneIndex ? -1 : 1
        ));
        return sortedTransactions;
    }

    private get txsHistory() {
        return this.state.transactionHistory?.history ?? [];
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
                                <Modal icon="info" data={mainHeaderMessage} />
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
                                        </div>
                                    </div>
                                    <div className="row space-between general-content">
                                        <div className="section--data">
                                            <Bech32Address
                                                addressDetails={this.state.bech32AddressDetails}
                                                advancedMode={true}
                                                showCopyButton={true}
                                            />
                                            {/* {!this.state.statusBusy && (
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
                                            )} */}

                                            {this.state.balance !== undefined && (
                                                <div className="row middle margin-t-m">
                                                    <Icon icon="wallet" boxed />
                                                    <div className="balance">
                                                        <div className="label">
                                                            Final balance
                                                        </div>
                                                        <div className="value featured">
                                                            {this.state.balance > 0 ? (
                                                                <div className="row middle">
                                                                    <span
                                                                        onClick={() => this.setState({
                                                                            isFormattedBalance: !this.state.isFormattedBalance
                                                                        })}
                                                                        className="pointer margin-r-5"
                                                                    >
                                                                        {this.state.isFormattedBalance ? this.state.balance : UnitsHelper.formatBest(this.state.balance)}
                                                                    </span>
                                                                    <span>(</span>
                                                                    <FiatValue value={this.state.balance} />
                                                                    <span>)</span>
                                                                    <CopyButton copy={String(this.state.balance)} />
                                                                </div>
                                                            ) : 0}
                                                        </div>
                                                    </div>
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

                                {this.txsHistory.length > 0 && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="row middle">
                                                <h2>
                                                    Transaction History
                                                </h2>
                                                <Modal icon="info" data={transactionHistoryMessage} />
                                            </div>
                                            {this.state.status && (
                                                <div className="margin-t-s middle row">
                                                    {this.state.statusBusy && (<Spinner />)}
                                                    <p className="status">
                                                        {this.state.status}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {this.txsHistory.length > this.state.pageSize && (
                                            <div className="sort-disclaimer">
                                                <span>
                                                    When displayed across multiple pages, the transaction history may lose exact ordering.
                                                </span>
                                            </div>
                                        )}
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
                                                {this.currentPageTransactions.map((transaction, k) =>
                                                (
                                                    <React.Fragment key={`${transaction?.messageId}${k}`}>
                                                        <Transaction
                                                            key={transaction?.messageId}
                                                            messageId={transaction?.messageId}
                                                            network={this.props.match.params.network}
                                                            inputs={transaction?.inputsCount}
                                                            outputs={transaction?.outputsCount}
                                                            messageTangleStatus={calculateTangleMessageStatus(transaction)}
                                                            date={DateHelper.formatShort(transaction?.milestoneTimestampReferenced * 1000)}
                                                            amount={transaction?.addressBalanceChange}
                                                            tableFormat={true}
                                                            hasConflicts={!transaction.ledgerInclusionState ||
                                                                transaction.ledgerInclusionState === "conflicting"}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Only visible in mobile -- Card transactions*/}
                                        <div className="transaction-cards">
                                            {this.currentPageTransactions.map((transaction, k) =>
                                            (
                                                <React.Fragment key={`${transaction?.messageId}${k}`}>
                                                    <Transaction
                                                        key={transaction?.messageId}
                                                        messageId={transaction?.messageId}
                                                        network={this.props.match.params.network}
                                                        inputs={transaction?.inputsCount}
                                                        outputs={transaction?.outputsCount}
                                                        messageTangleStatus={calculateTangleMessageStatus(transaction)}
                                                        date={DateHelper.formatShort(transaction?.milestoneTimestampReferenced * 1000)}
                                                        amount={transaction?.addressBalanceChange}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={this.state.currentPage}
                                            totalCount={this.txsHistory.length}
                                            pageSize={this.state.pageSize}
                                            extraPageRangeLimit={20}
                                            siblingsCount={1}
                                            onPageChange={page => this.setState({ currentPage: page })}
                                        />
                                    </div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private async getTransactionHistory() {
        const transactionHistory = await this._tangleCacheService.transactionsHistory({
            network: this.props.match.params.network,
            address: this.state.address?.address ?? ""
        }, false);

        this.setState({
            status: "",
            statusBusy: false,
            transactionHistory
        });
    }
}

export default Addr;
