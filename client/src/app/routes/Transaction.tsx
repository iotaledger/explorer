import isBundle from "@iota/bundle-validator";
import { trytesToTrits, value } from "@iota/converter";
import { asTransactionTrytes } from "@iota/transaction-converter";
import { isEmpty, isTrytes } from "@iota/validators";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import chevronLeftGreen from "../../assets/chevron-left-green.svg";
import chevronRightGreen from "../../assets/chevron-right-green.svg";
import copyGray from "../../assets/copy-gray.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ClipboardHelper } from "../../helpers/clipboardHelper";
import { DateHelper } from "../../helpers/dateHelper";
import { TrytesHelper } from "../../helpers/trytesHelper";
import { ICachedTransaction } from "../../models/ICachedTransaction";
import { NetworkService } from "../../services/networkService";
import { TangleCacheService } from "../../services/tangleCacheService";
import AsyncComponent from "../components/AsyncComponent";
import Confirmation from "../components/Confirmation";
import CurrencyButton from "../components/CurrencyButton";
import MessageButton from "../components/MessageButton";
import SidePanel from "../components/SidePanel";
import Spinner from "../components/Spinner";
import ValueButton from "../components/ValueButton";
import "./Transaction.scss";
import { TransactionRouteProps } from "./TransactionRouteProps";
import { TransactionState } from "./TransactionState";

/**
 * Component which will show the transaction page.
 */
class Transaction extends AsyncComponent<RouteComponentProps<TransactionRouteProps>, TransactionState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Create a new instance of Transaction.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<TransactionRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        let hash;
        if (this.props.match.params.hash.length === 81 &&
            isTrytes(this.props.match.params.hash)) {
            hash = props.match.params.hash;
        }

        this.state = {
            statusBusy: true,
            status: "Building transaction details...",
            hash,
            showRawMessageTrytes: false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (this.state.hash) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            const transactions = await this._tangleCacheService.getTransactions(
                this.props.match.params.network, [this.props.match.params.hash]);

            let details: ICachedTransaction | undefined;

            if (transactions && transactions.length > 0) {
                if (isEmpty(asTransactionTrytes(transactions[0].tx))) {
                    this.setState({
                        status: "There is no data for this transaction.",
                        statusBusy: false
                    });
                } else {
                    details = transactions[0];

                    this.buildDetails(details);
                }
            } else {
                this.setState({
                    status: "Unable to load the details for this transaction.",
                    statusBusy: false
                });
            }
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.hash}`);
        }
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="transaction">
                <div className="wrapper">
                    <div className="inner">
                        <h1>
                            Transaction
                        </h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card">
                                    <div className="card--header card--header__space-between">
                                        <h2>
                                            General
                                            {this.state.details && this.state.milestoneIndex === undefined && (
                                                <Confirmation state={this.state.details.confirmationState} />
                                            )}
                                            {this.state.milestoneIndex !== undefined && (
                                                <div className="card--header-count card--header-count__success">
                                                    Milestone Index {this.state.milestoneIndex}
                                                </div>
                                            )}
                                        </h2>
                                        {this.state.details && (
                                            <div className="h1-sub">
                                                {DateHelper.format(
                                                    DateHelper.milliseconds(
                                                        this.state.details.tx.timestamp === 0
                                                            ? this.state.details.tx.attachmentTimestamp
                                                            : this.state.details.tx.timestamp))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Hash
                                        </div>
                                        <div className="card--value">
                                            {this.state.hash}
                                        </div>
                                        {this.state.details && (
                                            <React.Fragment>
                                                {this.state.details.tx.timestamp !== 0 && (
                                                    <React.Fragment>
                                                        <div className="card--label">
                                                            Timestamp
                                                        </div>
                                                        <div className="card--value">
                                                            {DateHelper.format(
                                                                DateHelper.milliseconds(
                                                                    this.state.details.tx.timestamp))}
                                                        </div>
                                                    </React.Fragment>
                                                )}
                                                {this.state.details.tx.value !== 0 && (
                                                    <div className="row fill margin-t-s margin-b-s value-buttons">
                                                        <div className="col">
                                                            <ValueButton value={this.state.details.tx.value} />
                                                        </div>
                                                        <div className="col">
                                                            <CurrencyButton
                                                                marketsRoute={
                                                                    `/${this.props.match.params.network}/markets`
                                                                }
                                                                value={this.state.details.tx.value}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {this.state.details.tx.value === 0 && (
                                                    <React.Fragment>
                                                        <div className="card--label">
                                                            Value
                                                        </div>
                                                        <div className="card--value">
                                                            0
                                                        </div>
                                                    </React.Fragment>
                                                )}
                                                <div className="card--label">
                                                    Address
                                                </div>
                                                <div className="card--value">
                                                    <button
                                                        type="button"
                                                        onClick={() => this.props.history.push(
                                                            `/${this.props.match.params.network
                                                            }/address/${this.state.details?.tx.address}`)}
                                                    >
                                                        {this.state.details.tx.address}
                                                    </button>
                                                </div>
                                            </React.Fragment>
                                        )}
                                    </div>
                                </div>
                                {this.state.status && (
                                    <div className="card margin-t-s">
                                        <div className="card--content middle row">
                                            {this.state.statusBusy && (<Spinner />)}
                                            <p className="status">
                                                {this.state.status}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {this.state.details && (
                                    <React.Fragment>
                                        <div className="card">
                                            <div className="card--header">
                                                <h2>Bundle</h2>
                                                {this.state.isBundleValid !== undefined && (
                                                    <div
                                                        className={classNames(
                                                            "card--header-count",
                                                            {
                                                                "card--header-count__error":
                                                                    this.state.isBundleValid !== "valid"
                                                            },
                                                            {
                                                                "card--header-count__success":
                                                                    this.state.isBundleValid === "valid"
                                                            }
                                                        )}
                                                    >
                                                        {this.state.isBundleValid === "valid"
                                                            ? "Valid"
                                                            : (this.state.isBundleValid === "consistency"
                                                                ? "Invalid consistency - transaction will never confirm"
                                                                : "Invalid - transaction will never confirm")}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="card--content">
                                                <div className="card--label">
                                                    Bundle Hash
                                                </div>
                                                <div className="card--value">
                                                    <button
                                                        type="button"
                                                        onClick={() => this.props.history.push(
                                                            `/${this.props.match.params.network
                                                            }/bundle/${this.state.details?.tx.bundle}`)}
                                                    >
                                                        {this.state.details?.tx.bundle}
                                                    </button>
                                                </div>

                                                <div className="card--label">
                                                    Index
                                                </div>
                                                <div className="card--value">
                                                    <button
                                                        type="button"
                                                        onClick={() => this.props.history.push(
                                                            `/${this.props.match.params.network
                                                            }/transaction/${this.state.previousTransaction}`)}
                                                        disabled={this.state.previousTransaction === undefined}
                                                    >
                                                        <img
                                                            src={chevronLeftGreen}
                                                            alt="Previous"
                                                            className="margin-r-t"
                                                        />
                                                    </button>
                                                    {this.state.details.tx.currentIndex + 1}
                                                    &nbsp;/&nbsp;
                                                    {this.state.details.tx.lastIndex + 1}
                                                    <button
                                                        type="button"
                                                        onClick={() => this.props.history.push(
                                                            `/${this.props.match.params.network
                                                            }/transaction/${this.state.nextTransaction}`)}
                                                        disabled={this.state.nextTransaction === undefined}
                                                    >
                                                        <img
                                                            src={chevronRightGreen}
                                                            alt="Next"
                                                            className="margin-l-t"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card">
                                            <div className="card--header">
                                                <h2>Content</h2>
                                            </div>
                                            <div className="card--content">
                                                <div className="row row--tablet-responsive">
                                                    <div className="col fill">
                                                        <div className="card--label">
                                                            Tag
                                                        </div>
                                                        <div className="card--value">
                                                            <button
                                                                type="button"
                                                                onClick={() => this.props.history.push(
                                                                    `/${this.props.match.params.network
                                                                    }/tag/${this.state.details?.tx.tag}`)}
                                                            >
                                                                {this.state.details.tx.tag}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="col fill">
                                                        <div className="card--label">
                                                            Obsolete Tag
                                                        </div>
                                                        <div className="card--value">
                                                            <button
                                                                type="button"
                                                                onClick={() => this.props.history.push(
                                                                    `/${this.props.match.params.network
                                                                    }/tag/${this.state.details?.tx.obsoleteTag}`)}
                                                            >
                                                                {this.state.details.tx.obsoleteTag}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.state.message !== undefined && (
                                                    <React.Fragment>
                                                        <div className="card--label row middle margin-b-2">
                                                            <span className="margin-r-s">
                                                                {this.state.messageType !== "Trytes" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => this.setState(
                                                                            {
                                                                                showRawMessageTrytes:
                                                                                    !this.state.showRawMessageTrytes
                                                                            })}
                                                                    >
                                                                        Message {this.state.showRawMessageTrytes
                                                                            ? "Trytes" : this.state.messageType}
                                                                    </button>
                                                                )}
                                                                {this.state.messageType === "Trytes" && (
                                                                    `Message ${this.state.messageType}`
                                                                )}
                                                            </span>
                                                            <MessageButton
                                                                message="Copied"
                                                                onClick={() => ClipboardHelper.copy(
                                                                    this.state.showRawMessageTrytes
                                                                        ? this.state.rawMessageTrytes
                                                                        : this.state.message)}
                                                            >
                                                                <img src={copyGray} alt="Copy" />
                                                            </MessageButton>
                                                        </div>
                                                        <div
                                                            className={
                                                                classNames(
                                                                    "card--value",
                                                                    "card--value-textarea",
                                                                    `card--value-textarea__${
                                                                    this.state.showRawMessageTrytes
                                                                        ? "trytes"
                                                                        : this.state.messageType?.toLowerCase()}`
                                                                )
                                                            }
                                                        >
                                                            {this.state.showRawMessageTrytes
                                                                ? this.state.rawMessageTrytes
                                                                : this.state.message}
                                                        </div>
                                                        {this.state.messageSpan && (
                                                            <div className="card--value">
                                                                The content of this message spans multiple transactions.
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                )}
                                            </div>
                                        </div>
                                        <div className="row margin-t-s row--tablet-responsive row--split">
                                            <div className="col fill">
                                                <div className="card">
                                                    <div className="card--header">
                                                        <h2>Parents</h2>
                                                    </div>
                                                    <div className="card--content">
                                                        <div className="card--label">
                                                            Trunk
                                                        </div>
                                                        <div className="card--value">
                                                            <button
                                                                type="button"
                                                                onClick={() => this.props.history.push(
                                                                    `/${this.props.match.params.network
                                                                    }/transaction/${
                                                                    this.state.details?.tx.trunkTransaction}`)}
                                                            >
                                                                {this.state.details.tx.trunkTransaction}
                                                            </button>
                                                        </div>
                                                        <div className="card--label">
                                                            Branch
                                                        </div>
                                                        <div className="card--value">
                                                            <button
                                                                type="button"
                                                                onClick={() => this.props.history.push(
                                                                    `/${this.props.match.params.network
                                                                    }/transaction/${
                                                                    this.state.details?.tx.branchTransaction}`)}
                                                            >
                                                                {this.state.details.tx.branchTransaction}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col fill">
                                                <div className="card">
                                                    <div className="card--header">
                                                        <h2>PoW</h2>
                                                    </div>
                                                    <div className="card--content">
                                                        <div className="card--label">
                                                            Weight Magnitude
                                                        </div>
                                                        <div className="card--value">
                                                            {this.state.mwm}
                                                        </div>
                                                        <div className="card--label">
                                                            Nonce
                                                        </div>
                                                        <div className="card--value">
                                                            {this.state.details.tx.nonce}
                                                        </div>
                                                        <div className="card--label">
                                                            Attachment Lower Bound
                                                        </div>
                                                        <div className="card--value">
                                                            {this.state.details.tx.attachmentTimestampLowerBound}
                                                        </div>
                                                        <div className="card--label">
                                                            Attachment Upper Bound
                                                        </div>
                                                        <div className="card--value">
                                                            {this.state.details.tx.attachmentTimestampUpperBound}
                                                        </div>
                                                        {this.state.details.tx.attachmentTimestamp !== 0 && (
                                                            <React.Fragment>
                                                                <div className="card--label">
                                                                    Attachment Timestamp
                                                                </div>
                                                                <div className="card--value">
                                                                    {DateHelper.format(
                                                                        this.state.details.tx.attachmentTimestamp)}
                                                                </div>
                                                            </React.Fragment>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col fill">
                                                <div className="card">
                                                    <div className="card--header">
                                                        <h2>Raw</h2>
                                                    </div>
                                                    <div className="card--content">
                                                        <div className="card--label row middle margin-b-2">
                                                            <span className="margin-r-s">
                                                                Trytes
                                                            </span>
                                                            {this.state.details && (
                                                                <MessageButton
                                                                    message="Copied"
                                                                    onClick={() => ClipboardHelper.copy(this.state.raw)}
                                                                >
                                                                    <img src={copyGray} alt="Copy" />
                                                                </MessageButton>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={classNames(
                                                                "card--value",
                                                                "card--value-textarea",
                                                                "card--value-textarea__tall"
                                                            )}
                                                        >
                                                            {this.state.raw}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>

                                )}
                            </div>
                            <SidePanel {...this.props} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Build the transaction details.
     * @param details The transaction to build the details from
     */
    private buildDetails(details?: ICachedTransaction): void {
        if (details) {
            const singleDecoded = TrytesHelper.decodeMessage(details?.tx.signatureMessageFragment);
            this.setState(
                {
                    status: "",
                    statusBusy: false,
                    details,
                    message: singleDecoded.message,
                    messageType: singleDecoded.messageType,
                    messageSpan: false,
                    mwm: TrytesHelper.calculateMwm(details.tx.hash),
                    raw: asTransactionTrytes(details.tx),
                    nextTransaction: details.tx.currentIndex < details.tx.lastIndex
                        ? details.tx.trunkTransaction : undefined,
                    rawMessageTrytes: details?.tx.signatureMessageFragment
                },
                async () => {
                    if (this.state.details) {
                        const thisGroup =
                            await this._tangleCacheService.getTransactionBundleGroup(
                                this.props.match.params.network,
                                this.state.details);

                        if (thisGroup.length > 0) {
                            const thisIndex = thisGroup.findIndex(t => t.tx.hash === this.state.details?.tx.hash);

                            const isBundleValid = isBundle(thisGroup.map(t => t.tx));
                            const isConsistent = thisGroup.map(tx => tx.tx.value).reduce((a, b) => a + b, 0) === 0;
                            const combinedMessages = thisGroup.map(t => t.tx.signatureMessageFragment).join("");
                            const spanMessage = TrytesHelper.decodeMessage(combinedMessages);

                            let message = this.state.message;
                            let messageType = this.state.messageType;
                            let messageSpan = this.state.messageSpan;
                            let rawMessageTrytes = this.state.rawMessageTrytes;

                            if ((spanMessage.messageType === "ASCII" ||
                                spanMessage.messageType === "JSON") &&
                                spanMessage.message !== this.state.message) {
                                message = spanMessage.message;
                                messageType = spanMessage.messageType;
                                rawMessageTrytes = combinedMessages;
                                messageSpan = true;
                            }

                            if (isBundleValid && isConsistent && this.state.details.confirmationState === "pending") {
                                this._timerId = setInterval(async () => this.checkConfirmation(), 10000);
                            }

                            this.setState({
                                nextTransaction:
                                    isBundleValid &&
                                        this.state.details.tx.currentIndex < this.state.details.tx.lastIndex
                                        ? this.state.details.tx.trunkTransaction : undefined,
                                previousTransaction:
                                    isBundleValid && thisIndex > 0 ? thisGroup[thisIndex - 1].tx.hash : undefined,
                                isBundleValid: !isConsistent ? "consistency" : (isBundleValid ? "valid" : "invalid"),
                                milestoneIndex: this.getMilestoneIndex(thisGroup),
                                message,
                                messageType,
                                messageSpan,
                                rawMessageTrytes
                            });
                        } else {
                            this.setState({
                                isBundleValid: "Invalid"
                            });
                        }
                    }
                });
        }
    }

    /**
     * Try and get a milestone index.
     * @param thisGroup The group of transactions.
     * @returns The milestone index if there is one.
     */
    private getMilestoneIndex(thisGroup: ICachedTransaction[]): number | undefined {
        let milestoneIndex;

        // This code needs propert signature validation etc
        if (thisGroup.length >= 2) {
            const networkService = ServiceFactory.get<NetworkService>("network");
            const networkConfig = networkService.get(this.props.match.params.network);
            if (networkConfig && thisGroup[0].tx.address === networkConfig.coordinatorAddress &&
                thisGroup.length === networkConfig.coordinatorSecurityLevel + 1) {
                const mi = value(trytesToTrits(thisGroup[0].tx.tag));
                if (!Number.isNaN(mi)) {
                    milestoneIndex = mi;
                }
            }
        }

        return milestoneIndex;
    }

    /**
     * Check the confirmation again.
     */
    private async checkConfirmation(): Promise<void> {
        const transactions = await this._tangleCacheService.getTransactions(
            this.props.match.params.network, [this.props.match.params.hash], true);

        if (transactions && transactions.length > 0) {
            if (transactions[0].confirmationState === "confirmed") {
                if (this._timerId) {
                    clearInterval(this._timerId);
                    this._timerId = undefined;
                }
                this.setState({
                    details: {
                        ...transactions[0],
                        confirmationState: "confirmed"
                    }
                });
            }
        }
    }
}

export default Transaction;
