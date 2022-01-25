import isBundle from "@iota/bundle-validator";
import { addChecksum } from "@iota/checksum";
import { trytesToTrits, value } from "@iota/converter";
import { parseMessage } from "@iota/mam-legacy";
import { asTransactionTrytes } from "@iota/transaction-converter";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import chevronLeftGreen from "../../../assets/chevron-left-green.svg";
import chevronRightGreen from "../../../assets/chevron-right-green.svg";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { DateHelper } from "../../../helpers/dateHelper";
import { TrytesHelper } from "../../../helpers/trytesHelper";
import { ICachedTransaction } from "../../../models/ICachedTransaction";
import { NetworkService } from "../../../services/networkService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Confirmation from "../../components/Confirmation";
import CurrencyButton from "../../components/CurrencyButton";
import JsonViewer from "../../components/JsonViewer";
import MessageButton from "../../components/MessageButton";
import SidePanel from "../../components/SidePanel";
import Spinner from "../../components/Spinner";
import ValueButton from "../../components/ValueButton";
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
            TrytesHelper.isTrytes(this.props.match.params.hash)) {
            hash = props.match.params.hash;
        }

        this.state = {
            statusBusy: true,
            status: "Building transaction details...",
            hash,
            showRawMessageTrytes: false,
            childrenBusy: true,
            actionBusy: false,
            actionBusyMessage: ""
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
                if (TrytesHelper.isEmpty(asTransactionTrytes(transactions[0].tx))) {
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
                                                <Confirmation
                                                    state={this.state.details.confirmationState}
                                                    milestoneIndex={this.state.details.milestoneIndex}
                                                />
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
                                                        this.state.details.tx.timestamp
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Hash
                                        </div>
                                        <div className="card--value row middle">
                                            <span className="margin-r-t">{this.state.hash}</span>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(this.state.hash)}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </div>
                                        {this.state.details && (
                                            <React.Fragment>
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
                                                <div className="card--value row middle">
                                                    <Link
                                                        to={`/${this.props.match.params.network
                                                            }/address/${this.state.address}`}
                                                        className="margin-r-t"
                                                    >
                                                        {this.state.address}
                                                        <span className="card--value__light">
                                                            {this.state.checksum}
                                                        </span>
                                                    </Link>
                                                    <MessageButton
                                                        onClick={() => ClipboardHelper.copy(
                                                            `${this.state.address}${this.state.checksum}`
                                                        )}
                                                        buttonType="copy"
                                                        labelPosition="top"
                                                    />
                                                </div>
                                                {this.state.details.confirmationState === "pending" &&
                                                    this.state.isBundleValid === "valid" && (
                                                        <React.Fragment>
                                                            <div className="card--label">
                                                                Actions
                                                            </div>
                                                            <div className="row middle">
                                                                <button
                                                                    type="button"
                                                                    className="card--action"
                                                                    disabled={this.state.actionBusy}
                                                                    onClick={() => this.reattach()}
                                                                >
                                                                    Reattach
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="card--action"
                                                                    disabled={this.state.actionBusy}
                                                                    onClick={() => this.promote()}
                                                                >
                                                                    Promote
                                                                </button>
                                                                <span className="card--action__busy row middle">
                                                                    {this.state.actionBusy && (
                                                                        <Spinner compact={true} />)}
                                                                    <p className="margin-l-t">
                                                                        {this.state.actionBusyMessage}
                                                                    </p>
                                                                </span>
                                                            </div>
                                                            {this.state.actionResultHash && (
                                                                <React.Fragment>
                                                                    <div className="card--label">
                                                                        Action Result Hash
                                                                    </div>
                                                                    <div className="card--value row middle">
                                                                        <Link
                                                                            to={
                                                                                `/${this.props.match.params.network
                                                                                }/transaction/
                                                                                ${this.state.actionResultHash}`
                                                                            }
                                                                            className="margin-r-t"
                                                                        >
                                                                            {this.state.actionResultHash}
                                                                        </Link>
                                                                        <MessageButton
                                                                            onClick={() => ClipboardHelper.copy(
                                                                                this.state.actionResultHash
                                                                            )}
                                                                            buttonType="copy"
                                                                            labelPosition="top"
                                                                        />
                                                                    </div>
                                                                </React.Fragment>
                                                            )}
                                                        </React.Fragment>
                                                    )}
                                            </React.Fragment>
                                        )}
                                    </div>
                                </div>
                                {this.state.status && (
                                    <div className="card margin-t-s">
                                        <div className="card--content middle row margin-t-s">
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
                                                                    this.state.isBundleValid === "invalid" ||
                                                                    this.state.isBundleValid === "consistency"
                                                            },
                                                            {
                                                                "card--header-count__warning":
                                                                    this.state.isBundleValid === "warning"
                                                            },
                                                            {
                                                                "card--header-count__success":
                                                                    this.state.isBundleValid === "valid"
                                                            }
                                                        )}
                                                    >
                                                        {this.state.isBundleValidMessage}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="card--content">
                                                <div className="card--label">
                                                    Bundle Hash
                                                </div>
                                                <div className="card--value row middle">
                                                    <Link
                                                        to={
                                                            `/${this.props.match.params.network
                                                            }/bundle/${this.state.details?.tx.bundle}`
                                                        }
                                                        className="margin-r-t"
                                                    >
                                                        {this.state.details?.tx.bundle}
                                                    </Link>
                                                    <MessageButton
                                                        onClick={() => ClipboardHelper.copy(
                                                            this.state.details?.tx.bundle)}
                                                        buttonType="copy"
                                                        labelPosition="top"
                                                    />
                                                </div>

                                                <div className="card--label">
                                                    Index
                                                </div>
                                                <div className="card--value row middle">
                                                    <Link
                                                        to={
                                                            `/${this.props.match.params.network
                                                            }/transaction/${this.state.previousTransaction}`
                                                        }
                                                        className={classNames(
                                                            "btn-navigation",
                                                            { disabled: this.state.previousTransaction === undefined }
                                                        )}
                                                    >
                                                        <img
                                                            src={chevronLeftGreen}
                                                            alt="Previous"
                                                            className="svg-navigation margin-r-t"
                                                        />
                                                    </Link>
                                                    <span>
                                                        {this.state.details.tx.currentIndex + 1}
                                                        &nbsp;/&nbsp;
                                                        {this.state.details.tx.lastIndex + 1}
                                                    </span>
                                                    <Link
                                                        to={
                                                            `/${this.props.match.params.network
                                                            }/transaction/${this.state.nextTransaction}`
                                                        }
                                                        className={classNames(
                                                            "btn-navigation",
                                                            { disabled: this.state.nextTransaction === undefined }
                                                        )}
                                                    >
                                                        <img
                                                            src={chevronRightGreen}
                                                            alt="Next"
                                                            className="svg-navigation margin-l-t"
                                                        />
                                                    </Link>
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
                                                        <div className="card--value row middle">
                                                            <Link
                                                                to={
                                                                    `/${this.props.match.params.network
                                                                    }/tag/${this.state.details?.tx.tag}`
                                                                }
                                                                className="margin-r-t"
                                                            >
                                                                {this.state.details.tx.tag}
                                                            </Link>
                                                            <MessageButton
                                                                onClick={() => ClipboardHelper.copy(
                                                                    this.state.details?.tx.tag)}
                                                                buttonType="copy"
                                                                labelPosition="top"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col fill">
                                                        <div className="card--label">
                                                            Obsolete Tag
                                                        </div>
                                                        <div className="card--value row middle">
                                                            <Link
                                                                to={
                                                                    `/${this.props.match.params.network
                                                                    }/tag/${this.state.details?.tx.obsoleteTag}`
                                                                }
                                                                className="margin-r-t"
                                                            >
                                                                {this.state.details.tx.obsoleteTag}
                                                            </Link>
                                                            <MessageButton
                                                                onClick={() => ClipboardHelper.copy(
                                                                    this.state.details?.tx.obsoleteTag)}
                                                                buttonType="copy"
                                                                labelPosition="top"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.state.streamsV0Root && (
                                                    <div className="col fill">
                                                        <div className="card--label">
                                                            Streams v0 Decoder Root
                                                        </div>
                                                        <div className="card--value row middle">
                                                            <Link
                                                                to={
                                                                    `/${this.props.match.params.network
                                                                    }/streams/0/${this.state.streamsV0Root}`
                                                                }
                                                                className="margin-r-t"
                                                            >
                                                                {this.state.streamsV0Root}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
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
                                                                onClick={() => ClipboardHelper.copy(
                                                                    this.state.showRawMessageTrytes
                                                                        ? this.state.rawMessageTrytes
                                                                        : this.state.message)}
                                                                buttonType="copy"
                                                                labelPosition="right"
                                                            />
                                                        </div>
                                                        <div
                                                            className={
                                                                classNames(
                                                                    "card--value",
                                                                    "card--value-textarea",
                                                                    `card--value-textarea__
                                                                    ${this.state.showRawMessageTrytes
                                                                        ? "trytes"
                                                                        : this.state.messageType?.toLowerCase()
                                                                    }`
                                                                )
                                                            }
                                                        >
                                                            {this.state.showRawMessageTrytes
                                                                ? this.state.rawMessageTrytes
                                                                : (this.state.messageType === "JSON"
                                                                    ? <JsonViewer json={this.state.message} />
                                                                    : this.state.message)}
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
                                                            <Link
                                                                to={
                                                                    `/${this.props.match.params.network
                                                                    }/transaction/
                                                                    ${this.state.details?.tx.trunkTransaction
                                                                    }`
                                                                }
                                                            >
                                                                {this.state.details.tx.trunkTransaction}
                                                            </Link>
                                                        </div>
                                                        <div className="card--label">
                                                            Branch
                                                        </div>
                                                        <div className="card--value">
                                                            <Link
                                                                to={
                                                                    `/${this.props.match.params.network
                                                                    }/transaction/
                                                                    ${this.state.details?.tx.branchTransaction
                                                                    }`
                                                                }
                                                            >
                                                                {this.state.details.tx.branchTransaction}
                                                            </Link>
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
                                                                        DateHelper.milliseconds(
                                                                            this.state.details.tx.attachmentTimestamp
                                                                        )
                                                                    )}
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
                                                                    onClick={() => ClipboardHelper.copy(this.state.raw)}
                                                                    buttonType="copy"
                                                                    labelPosition="right"
                                                                />
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
                                        <div className="card margin-t-s">
                                            <div className="card--header">
                                                <h2>Children</h2>
                                                {this.state.children !== undefined && (
                                                    <span className="card--header-count">
                                                        {this.state.children.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="card--content children-container">
                                                {this.state.childrenBusy && (<Spinner />)}
                                                {this.state.children?.map(child => (
                                                    <div className="card--value" key={child}>
                                                        <Link
                                                            to={
                                                                `/${this.props.match.params.network
                                                                }/transaction/${child}`
                                                            }
                                                        >
                                                            {child}
                                                        </Link>
                                                    </div>
                                                ))}
                                                {!this.state.childrenBusy &&
                                                    this.state.children &&
                                                    this.state.children.length === 0 && (
                                                        <p>There are no children for this message.</p>
                                                    )}

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
            let streamsV0Root: string | undefined;
            let messageTrytes = details?.tx.signatureMessageFragment;

            try {
                // Can we parse the content as a StreamsV0 Message
                const parsedStreamsV0 = parseMessage(details.tx.signatureMessageFragment, details.tx.address);
                if (parsedStreamsV0.message) {
                    messageTrytes = parsedStreamsV0.message;
                    streamsV0Root = details.tx.address;
                }
            } catch { }

            const singleDecoded = TrytesHelper.decodeMessage(messageTrytes);

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
                    rawMessageTrytes: details?.tx.signatureMessageFragment,
                    bundleTailHash: details?.tx.currentIndex === 0 ? details.tx.hash : undefined,
                    streamsV0Root,
                    address: details?.tx.address,
                    checksum: addChecksum(details?.tx.address).slice(-9)
                },
                async () => {
                    if (this.state.details) {
                        const thisGroup =
                            await this._tangleCacheService.getTransactionBundleGroup(
                                this.props.match.params.network,
                                this.state.details);

                        if (thisGroup.length > 0) {
                            const thisIndex = thisGroup.findIndex(t => t.tx.hash === this.state.details?.tx.hash);

                            // Some really old bundle formats dont pass the isBundle test, so if they are already
                            // confirmed use that knowledge instead.
                            const isBundleValid = this.state.details.confirmationState === "confirmed"
                                ? true
                                : isBundle(thisGroup.map(t => t.tx));
                            let total = 0;
                            for (const g of thisGroup) {
                                total += g.tx.value;
                            }
                            const isConsistent = total === 0;

                            let message = this.state.message;
                            let messageType = this.state.messageType;
                            let messageSpan = this.state.messageSpan;
                            let rawMessageTrytes = this.state.rawMessageTrytes;
                            if (thisGroup.length < 10) {
                                let combinedMessages = thisGroup.map(t => t.tx.signatureMessageFragment).join("");

                                try {
                                    const parsedStreamsV0 = parseMessage(combinedMessages, details.tx.address);
                                    if (parsedStreamsV0.message) {
                                        combinedMessages = parsedStreamsV0.message;
                                        streamsV0Root = details.tx.address;
                                    }
                                } catch { }

                                const spanMessage = TrytesHelper.decodeMessage(combinedMessages);

                                if ((spanMessage.messageType === "ASCII" ||
                                    spanMessage.messageType === "JSON") &&
                                    spanMessage.message !== this.state.message) {
                                    message = spanMessage.message;
                                    messageType = spanMessage.messageType;
                                    rawMessageTrytes = combinedMessages;
                                    messageSpan = true;
                                }
                            }

                            if (isBundleValid && isConsistent && this.state.details.confirmationState === "pending") {
                                this._timerId = setInterval(async () => this.checkConfirmation(), 10000);
                            }

                            const isBundleValidState = !isConsistent
                                ? "consistency"
                                : (isBundleValid ? "valid" : "invalid");

                            let isBundleValidMessage = "Valid";
                            if (isBundleValidState !== "valid") {
                                isBundleValidMessage = this.state.isBundleValid === "consistency"
                                    ? "Invalid consistency - transaction will never confirm"
                                    : "Invalid - transaction will never confirm";
                            }

                            this.setState({
                                nextTransaction:
                                    this.state.details.tx.currentIndex < this.state.details.tx.lastIndex
                                        ? this.state.details.tx.trunkTransaction : undefined,
                                previousTransaction:
                                    thisIndex > 0 ? thisGroup[thisIndex - 1].tx.hash : undefined,
                                isBundleValid: isBundleValidState,
                                isBundleValidMessage,
                                milestoneIndex: this.getMilestoneIndex(thisGroup),
                                message,
                                messageType,
                                messageSpan,
                                rawMessageTrytes,
                                bundleTailHash: thisGroup[0].tx.hash,
                                streamsV0Root
                            }, async () => {
                                const children = await this._tangleCacheService.getTransactionChildren(
                                    this.props.match.params.network, this.props.match.params.hash);

                                this.setState({
                                    children,
                                    childrenBusy: false
                                });
                            });
                        } else {
                            this.setState({
                                isBundleValid: "warning",
                                isBundleValidMessage: "Unknown - transactions from the bundle are unavailable"
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
                networkConfig.coordinatorSecurityLevel !== undefined &&
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

        if (transactions && transactions.length > 0 && transactions[0].confirmationState === "confirmed") {
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

    /**
     * Reattach the transaction.
     */
    private reattach(): void {
        this.setState(
            {
                actionBusy: true,
                actionBusyMessage: "Reattaching bundle, please wait...",
                actionResultHash: ""
            },
            async () => {
                const newHash = await this._tangleCacheService.replayBundle(
                    this.props.match.params.network,
                    this.state.bundleTailHash ?? "");

                this.setState(
                    {
                        actionBusy: false,
                        actionBusyMessage: newHash
                            ? "Bundle reattached."
                            : "Unable to reattach bundle.",
                        actionResultHash: newHash
                    },
                    async () => {
                        if (newHash) {
                            await this.checkConfirmation();
                        }
                    });
            });
    }

    /**
     * Promote the transaction.
     */
    private promote(): void {
        this.setState(
            {
                actionBusy: true,
                actionBusyMessage: "Promoting transaction, please wait...",
                actionResultHash: undefined
            },
            async () => {
                const isPromotable = await this._tangleCacheService.canPromoteTransaction(
                    this.props.match.params.network,
                    this.state.bundleTailHash ?? "");

                if (isPromotable) {
                    const newHash = await this._tangleCacheService.promoteTransaction(
                        this.props.match.params.network,
                        this.state.bundleTailHash ?? "");

                    this.setState(
                        {
                            actionBusy: false,
                            actionBusyMessage: newHash
                                ? "Transaction promoted."
                                : "Unable to promote transaction.",
                            actionResultHash: newHash
                        },
                        async () => {
                            if (newHash) {
                                await this.checkConfirmation();
                            }
                        }
                    );
                } else {
                    this.setState({
                        actionBusy: false,
                        actionBusyMessage: "This transaction is not promotable."
                    });
                }
            });
    }
}

export default Transaction;
