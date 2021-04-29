import { CONFLICT_REASON_STRINGS, IMessageMetadata, INDEXATION_PAYLOAD_TYPE, MILESTONE_PAYLOAD_TYPE, serializeMessage, TRANSACTION_PAYLOAD_TYPE, WriteStream } from "@iota/iota.js";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { FaFileDownload } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import chevronDownGray from "../../../assets/chevron-down-gray.svg";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { DownloadHelper } from "../../../helpers/downloadHelper";
import { MessageTangleStatus } from "../../../models/messageTangleStatus";
import { SettingsService } from "../../../services/settingsService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import IndexationPayload from "../../components/chrysalis/IndexationPayload";
import MilestonePayload from "../../components/chrysalis/MilestonePayload";
import ReceiptPayload from "../../components/chrysalis/ReceiptPayload";
import TransactionPayload from "../../components/chrysalis/TransactionPayload";
import InclusionState from "../../components/InclusionState";
import MessageButton from "../../components/MessageButton";
import MessageTangleState from "../../components/MessageTangleState";
import SidePanel from "../../components/SidePanel";
import Spinner from "../../components/Spinner";
import ToolsPanel from "../../components/ToolsPanel";
import "./Message.scss";
import { MessageRouteProps } from "./MessageRouteProps";
import { MessageState } from "./MessageState";

/**
 * Component which will show the message page.
 */
class Message extends AsyncComponent<RouteComponentProps<MessageRouteProps>, MessageState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Create a new instance of Message.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<MessageRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        this.state = {
            messageTangleStatus: "pending",
            childrenBusy: true,
            dataUrls: {},
            selectedDataUrl: "json",
            advancedMode: this._settingsService.get().advancedMode ?? false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.messageId);

        if (result?.message) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            const writeStream = new WriteStream();
            serializeMessage(writeStream, result.message);
            const finalBytes = writeStream.finalBytes();

            const dataUrls = {
                json: DownloadHelper.createJsonDataUrl(result.message),
                bin: DownloadHelper.createBinaryDataUrl(finalBytes),
                base64: DownloadHelper.createBase64DataUrl(finalBytes),
                hex: DownloadHelper.createHexDataUrl(finalBytes)
            };

            window.history.replaceState(undefined, window.document.title, `/${this.props.match.params.network
                }/message/${result.includedMessageId ?? this.props.match.params.messageId}`);

            this.setState({
                paramMessageId: this.props.match.params.messageId,
                actualMessageId: result.includedMessageId ?? this.props.match.params.messageId,
                message: result.message,
                dataUrls
            }, async () => {
                await this.updateMessageDetails();
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network
                }/search/${this.props.match.params.messageId}`);
        }
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._timerId) {
            clearTimeout(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="message">
                <div className="wrapper">
                    <div className="inner">
                        <h1>
                            Message
                        </h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card">
                                    <div
                                        className={classNames(
                                            "card--header",
                                            "card--header__space-between",
                                            "card--header__tablet-responsive"
                                        )}
                                    >
                                        <h2>
                                            General
                                        </h2>
                                        <MessageTangleState
                                            network={this.props.match.params.network}
                                            status={this.state.messageTangleStatus}
                                            milestoneIndex={this.state.metadata?.referencedByMilestoneIndex ??
                                                this.state.metadata?.milestoneIndex}
                                            onClick={this.state.metadata?.referencedByMilestoneIndex
                                                ? () => this.props.history.push(
                                                    `/${this.props.match.params.network
                                                    }/search/${this.state.metadata?.referencedByMilestoneIndex}`)
                                                : undefined}
                                        />
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Message Id
                                        </div>
                                        <div className="card--value row middle">
                                            <span className="margin-r-t">{this.state.actualMessageId}</span>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(
                                                    this.state.actualMessageId
                                                )}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </div>
                                        {this.state.paramMessageId !== this.state.actualMessageId && (
                                            <React.Fragment>
                                                <div className="card--label">
                                                    Transaction Id
                                                </div>
                                                <div className="card--value card--value__secondary row middle">
                                                    <span className="margin-r-t">{this.state.paramMessageId}</span>
                                                    <MessageButton
                                                        onClick={() => ClipboardHelper.copy(
                                                            this.state.paramMessageId
                                                        )}
                                                        buttonType="copy"
                                                        labelPosition="top"
                                                    />
                                                </div>
                                            </React.Fragment>
                                        )}
                                        {this.state.advancedMode &&
                                            this.state.message?.parentMessageIds?.map((parent, idx) => (
                                                <React.Fragment key={idx}>
                                                    <div className="card--label">
                                                        Parent Message {idx + 1}
                                                    </div>
                                                    <div className="card--value row middle">
                                                        {parent !== "0".repeat(64) && (
                                                            <React.Fragment>
                                                                <Link
                                                                    className="margin-r-t"
                                                                    to={
                                                                        `/${this.props.match.params.network
                                                                        }/message/${parent}`
                                                                    }
                                                                >
                                                                    {parent}
                                                                </Link>
                                                                <MessageButton
                                                                    onClick={() => ClipboardHelper.copy(
                                                                        parent
                                                                    )}
                                                                    buttonType="copy"
                                                                    labelPosition="top"
                                                                />
                                                            </React.Fragment>
                                                        )}
                                                        {parent === "0".repeat(64) && (
                                                            <span>Genesis</span>
                                                        )}
                                                    </div>
                                                </React.Fragment>
                                            )
                                            )}
                                        {this.state.advancedMode && (
                                            <React.Fragment>
                                                <div className="card--label">
                                                    Nonce
                                                </div>
                                                <div className="card--value row middle">
                                                    <span className="margin-r-t">{this.state.message?.nonce}</span>
                                                </div>
                                            </React.Fragment>
                                        )}
                                        {!this.state.advancedMode && (
                                            <React.Fragment>
                                                <div className="card--label">
                                                    Ledger Inclusion
                                                </div>
                                                <div className="card--value row middle">
                                                    <InclusionState state={this.state.metadata?.ledgerInclusionState} />
                                                </div>
                                                {this.state.conflictReason && (
                                                    <React.Fragment>
                                                        <div className="card--label">
                                                            Conflict Reason
                                                        </div>
                                                        <div className="card--value">
                                                            {this.state.conflictReason}
                                                        </div>
                                                    </React.Fragment>
                                                )}
                                            </React.Fragment>
                                        )}
                                    </div>
                                </div>

                                {this.state.advancedMode && (
                                    <div className="card">
                                        <div className="card--header card--header__space-between">
                                            <h2>
                                                Metadata
                                            </h2>
                                        </div>
                                        <div className="card--content">
                                            {!this.state.metadata && !this.state.metadataError && (
                                                <Spinner />
                                            )}
                                            {this.state.metadataError && (
                                                <p className="danger">
                                                    Failed to retrieve metadata. {this.state.metadataError}
                                                </p>
                                            )}
                                            {this.state.metadata && !this.state.metadataError && (
                                                <React.Fragment>
                                                    <div className="card--label">
                                                        Is Solid
                                                    </div>
                                                    <div className="card--value row middle">
                                                        <span className="margin-r-t">
                                                            {this.state.metadata?.isSolid ? "Yes" : "No"}
                                                        </span>
                                                    </div>
                                                    <div className="card--label">
                                                        Ledger Inclusion
                                                    </div>
                                                    <div className="card--value row middle">
                                                        <InclusionState
                                                            state={this.state.metadata?.ledgerInclusionState}
                                                        />
                                                    </div>
                                                    {this.state.conflictReason && (
                                                        <React.Fragment>
                                                            <div className="card--label">
                                                                Conflict Reason
                                                            </div>
                                                            <div className="card--value">
                                                                {this.state.conflictReason}
                                                            </div>
                                                        </React.Fragment>
                                                    )}
                                                </React.Fragment>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {this.state.message?.payload && (
                                    <React.Fragment>
                                        {this.state.message.payload.type === TRANSACTION_PAYLOAD_TYPE && (
                                            <React.Fragment>
                                                <div className="transaction-payload-wrapper">
                                                    <TransactionPayload
                                                        network={this.props.match.params.network}
                                                        history={this.props.history}
                                                        payload={this.state.message.payload}
                                                        advancedMode={this.state.advancedMode}
                                                    />
                                                </div>

                                                {this.state.message.payload.essence.payload && (
                                                    <div className="card">
                                                        <IndexationPayload
                                                            network={this.props.match.params.network}
                                                            history={this.props.history}
                                                            payload={this.state.message.payload.essence.payload}
                                                            advancedMode={this.state.advancedMode}
                                                        />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        )}
                                        {this.state.message.payload.type === MILESTONE_PAYLOAD_TYPE && (
                                            <React.Fragment>
                                                <div className="card">
                                                    <MilestonePayload
                                                        network={this.props.match.params.network}
                                                        history={this.props.history}
                                                        payload={this.state.message.payload}
                                                        advancedMode={this.state.advancedMode}
                                                    />
                                                </div>
                                                {this.state.message.payload.receipt && (
                                                    <div className="card">
                                                        <ReceiptPayload
                                                            network={this.props.match.params.network}
                                                            payload={this.state.message.payload.receipt}
                                                            advancedMode={this.state.advancedMode}
                                                        />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        )}
                                        {this.state.message.payload.type === INDEXATION_PAYLOAD_TYPE && (
                                            <div className="card">
                                                <IndexationPayload
                                                    network={this.props.match.params.network}
                                                    history={this.props.history}
                                                    payload={this.state.message.payload}
                                                    advancedMode={this.state.advancedMode}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}
                                {this.state.advancedMode && (
                                    <div className="card margin-t-s">
                                        <div className="card--header">
                                            <h2>Child Messages</h2>
                                            {this.state.childrenIds !== undefined && (
                                                <span className="card--header-count">
                                                    {this.state.childrenIds.length}
                                                </span>
                                            )}
                                        </div>
                                        <div className="card--content children-container">
                                            {this.state.childrenBusy && (<Spinner />)}
                                            {this.state.childrenIds?.map(childId => (
                                                <div className="card--value" key={childId}>
                                                    <Link
                                                        to={
                                                            `/${this.props.match.params.network
                                                            }/message/${childId}`
                                                        }
                                                    >
                                                        {childId}
                                                    </Link>
                                                </div>
                                            ))}
                                            {!this.state.childrenBusy &&
                                                this.state.childrenIds &&
                                                this.state.childrenIds.length === 0 && (
                                                    <p>There are no children for this message.</p>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="side-panel-container">
                                <SidePanel {...this.props} />
                                <ToolsPanel>
                                    <div className="card--section">
                                        <div className="card--label margin-t-t margin-b-t">
                                            <span>Advanced View</span>
                                            <input
                                                type="checkbox"
                                                checked={this.state.advancedMode}
                                                className="margin-l-t"
                                                onChange={e => this.setState(
                                                    {
                                                        advancedMode: e.target.checked
                                                    },
                                                    () => this._settingsService.saveSingle(
                                                        "advancedMode",
                                                        this.state.advancedMode))}
                                            />
                                        </div>
                                        <div className="card--label card--label__underline">
                                            Export Message
                                        </div>
                                        <div className="card--value row">
                                            <div className="select-wrapper">
                                                <select
                                                    value={this.state.selectedDataUrl}
                                                    onChange={e => this.setState(
                                                        { selectedDataUrl: e.target.value })}
                                                >
                                                    <option value="json">JSON</option>
                                                    <option value="bin">Binary</option>
                                                    <option value="hex">Hex</option>
                                                    <option value="base64">Base64</option>
                                                </select>
                                                <img src={chevronDownGray} alt="expand" />
                                            </div>
                                            <a
                                                className="card--action card--action-icon"
                                                href={this.state.dataUrls[this.state.selectedDataUrl]}
                                                download={DownloadHelper.filename(
                                                    this.state.actualMessageId ?? "", this.state.selectedDataUrl)}
                                                role="button"
                                            >
                                                <FaFileDownload />
                                            </a>
                                        </div>
                                    </div>
                                </ToolsPanel>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Update the message details.
     */
    private async updateMessageDetails(): Promise<void> {
        const details = await this._tangleCacheService.messageDetails(
            this.props.match.params.network, this.state.actualMessageId ?? "");

        this.setState({
            metadata: details?.metadata,
            metadataError: details?.error,
            conflictReason: this.calculateConflictReason(details?.metadata),
            childrenIds: details?.childrenIds && details?.childrenIds.length > 0
                ? details?.childrenIds : (this.state.childrenIds ?? []),
            messageTangleStatus: this.calculateStatus(details?.metadata),
            childrenBusy: false
        });

        if (!details?.metadata?.referencedByMilestoneIndex) {
            this._timerId = setTimeout(async () => {
                await this.updateMessageDetails();
            }, 10000);
        }
    }

    /**
     * Calculate the status for the message.
     * @param metadata The metadata to calculate the status from.
     * @returns The message status.
     */
    private calculateStatus(metadata?: IMessageMetadata): MessageTangleStatus {
        let messageTangleStatus: MessageTangleStatus = "unknown";

        if (metadata) {
            if (metadata.milestoneIndex) {
                messageTangleStatus = "milestone";
            } else if (metadata.referencedByMilestoneIndex) {
                messageTangleStatus = "referenced";
            } else {
                messageTangleStatus = "pending";
            }
        }

        return messageTangleStatus;
    }

    /**
     * Calculate the conflict reason for the message.
     * @param metadata The metadata to calculate the conflict reason from.
     * @returns The conflict reason.
     */
    private calculateConflictReason(metadata?: IMessageMetadata): string {
        let conflictReason: string = "";

        if (metadata?.ledgerInclusionState === "conflicting") {
            conflictReason = metadata.conflictReason && CONFLICT_REASON_STRINGS[metadata.conflictReason]
                ? CONFLICT_REASON_STRINGS[metadata.conflictReason]
                : "The reason for the conflict is unknown";
        }

        return conflictReason;
    }
}

export default Message;
