import { CONFLICT_REASON_STRINGS, IMessageMetadata, INDEXATION_PAYLOAD_TYPE, MILESTONE_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE, UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "./../../../assets/modals/chrysalis/message/main-header.json";
import metadataMessage from "./../../../assets/modals/chrysalis/message/metadata.json";
import treeMessage from "./../../../assets/modals/chrysalis/message/tree.json";
import { MessageState } from "./MessageState";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { TransactionsHelper } from "../../../helpers/chrysalis/transactionsHelper";
import { CHRYSALIS } from "../../../models/config/protocolVersion";
import { TangleStatus } from "../../../models/tangleStatus";
import { ChrysalisTangleCacheService } from "../../../services/chrysalis/chrysalisTangleCacheService";
import { NetworkService } from "../../../services/networkService";
import { SettingsService } from "../../../services/settingsService";
import AsyncComponent from "../../components/AsyncComponent";
import InclusionState from "../../components/chrysalis/InclusionState";
import IndexationPayload from "../../components/chrysalis/IndexationPayload";
import MessageTangleState from "../../components/chrysalis/MessageTangleState";
import MessageTree from "../../components/chrysalis/MessageTree";
import MilestonePayload from "../../components/chrysalis/MilestonePayload";
import ReceiptPayload from "../../components/chrysalis/ReceiptPayload";
import TransactionPayload from "../../components/chrysalis/TransactionPayload";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import Switcher from "../../components/Switcher";
import { MessageProps } from "../chrysalis/MessageProps";
import "./Message.scss";
/**
 * Component which will show the message page.
 */
class Message extends AsyncComponent<RouteComponentProps<MessageProps>, MessageState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: ChrysalisTangleCacheService;

    /**
     * Settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of Message.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<MessageProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<ChrysalisTangleCacheService>(
            `tangle-cache-${CHRYSALIS}`
        );
        this._settingsService = ServiceFactory.get<SettingsService>("settings");


        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._bechHrp = networkConfig?.bechHrp ?? "iota";

        this.state = {
            messageTangleStatus: "pending",
            childrenBusy: true,
            advancedMode: this._settingsService.get().advancedMode ?? false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.loadMessage(this.props.match.params.messageId, false);
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
                        <div className="message--header">
                            <div className="row middle">
                                <h1>
                                    Message
                                </h1>
                                <Modal icon="info" data={mainHeaderMessage} />
                            </div>
                            <Switcher
                                label="Advanced View"
                                checked={this.state.advancedMode}
                                onToggle={e => this.setState(
                                    {
                                        advancedMode: e.target.checked
                                    },
                                    () => this._settingsService.saveSingle(
                                        "advancedMode",
                                        this.state.advancedMode))}
                            />
                        </div>

                        <div className="section">
                            <div className="section--header row row--tablet-responsive middle space-between">
                                <div className="row middle">
                                    <h2>General</h2>
                                </div>

                                <MessageTangleState
                                    network={this.props.match.params.network}
                                    status={this.state.messageTangleStatus}
                                    milestoneIndex={this.state.metadata?.referencedByMilestoneIndex ??
                                        this.state.metadata?.milestoneIndex}
                                    hasConflicts={this.state.metadata?.ledgerInclusionState === "conflicting"}
                                    onClick={this.state.metadata?.referencedByMilestoneIndex
                                        ? (messageId: string) => this.props.history.push(
                                            `/${this.props.match.params.network
                                            }/search/${messageId}`)
                                        : undefined}
                                />
                            </div>
                            <div className="section--data">
                                <div className="label">
                                    Message ID
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {this.state.actualMessageId}
                                    </span>
                                    <CopyButton copy={this.state.actualMessageId} />
                                </div>
                            </div>

                            {this.state.transactionId && (
                                <div className="section--data">
                                    <div className="label">
                                        Transaction Id
                                    </div>
                                    <div className="value value__secondary row middle">
                                        <span className="margin-r-t">{this.state.transactionId}</span>
                                        <CopyButton copy={this.state.transactionId} />
                                    </div>
                                </div>
                            )}
                            <div className="section--data">
                                <div className="label">
                                    Payload Type
                                </div>
                                <div className="value row middle">
                                    {this.state.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                                        ("Transaction")}
                                    {this.state.message?.payload?.type === MILESTONE_PAYLOAD_TYPE &&
                                        ("Milestone")}
                                    {this.state.message?.payload?.type === INDEXATION_PAYLOAD_TYPE &&
                                        ("Index")}
                                    {this.state.message?.payload?.type === undefined &&
                                        ("No Payload")}
                                </div>
                            </div>
                            {this.state.advancedMode && (
                                <div className="section--data">
                                    <div className="label">
                                        Nonce
                                    </div>
                                    <div className="value row middle">
                                        <span className="margin-r-t">{this.state.message?.nonce}</span>
                                    </div>
                                </div>
                            )}
                            {this.state.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                                this.state.transferTotal !== undefined && (
                                    <div className="section--data">
                                        <div className="label">
                                            Value
                                        </div>
                                        <div className="value row middle">
                                            {UnitsHelper.formatUnits(this.state.transferTotal,
                                                UnitsHelper.calculateBest(this.state.transferTotal))}
                                            {" "}
                                            (<FiatValue value={this.state.transferTotal} />)
                                        </div>
                                    </div>
                                )}
                        </div>


                        {this.state.message?.payload && (
                            <React.Fragment>
                                {this.state.message.payload.type === TRANSACTION_PAYLOAD_TYPE &&
                                    this.state.inputs &&
                                    this.state.outputs &&
                                    this.state.transferTotal !== undefined &&
                                    (
                                        <div className="section">
                                            <TransactionPayload
                                                network={this.props.match.params.network}
                                                history={this.props.history}
                                                inputs={this.state.inputs}
                                                outputs={this.state.outputs}
                                                transferTotal={this.state.transferTotal}
                                            />
                                        </div>
                                    )}
                                {this.state.message.payload.type === TRANSACTION_PAYLOAD_TYPE &&
                                    this.state.message.payload.essence.payload && (
                                        <div className="section">
                                            <IndexationPayload
                                                network={this.props.match.params.network}
                                                history={this.props.history}
                                                payload={this.state.message.payload.essence.payload}
                                                advancedMode={this.state.advancedMode}
                                            />
                                        </div>)}
                                {this.state.message.payload.type === MILESTONE_PAYLOAD_TYPE && (
                                    <React.Fragment>
                                        <div className="section">
                                            <MilestonePayload
                                                network={this.props.match.params.network}
                                                history={this.props.history}
                                                payload={this.state.message.payload}
                                                advancedMode={this.state.advancedMode}
                                            />
                                        </div>
                                        {this.state.message.payload.receipt && (
                                            <div className="section">
                                                <ReceiptPayload
                                                    network={this.props.match.params.network}
                                                    history={this.props.history}
                                                    payload={this.state.message.payload.receipt}
                                                    advancedMode={this.state.advancedMode}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}
                                {this.state.message.payload.type === INDEXATION_PAYLOAD_TYPE && (
                                    <div className="section">
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
                            <div className="section">
                                <div className="section--header section--header__space-between">
                                    <div className="row middle">
                                        <h2>
                                            Metadata
                                            <Modal icon="info" data={metadataMessage} />
                                        </h2>
                                    </div>
                                </div>
                                <div className="section--data">
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
                                            <div className="section--data">
                                                <div className="label">
                                                    Is Solid
                                                </div>
                                                <div className="value row middle">
                                                    <span className="margin-r-t">
                                                        {this.state.metadata?.isSolid ? "Yes" : "No"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="section--data">
                                                <div className="label">
                                                    Ledger Inclusion
                                                </div>
                                                <div className="value row middle">
                                                    <InclusionState
                                                        state={this.state.metadata?.ledgerInclusionState}
                                                    />
                                                </div>
                                            </div>
                                            {this.state.conflictReason && (
                                                <div className="section--data">
                                                    <div className="label">
                                                        Conflict Reason
                                                    </div>
                                                    <div className="value">
                                                        {this.state.conflictReason}
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="section">
                            <div className="section--header">
                                <div>
                                    <div className="row middle">
                                        <h2>
                                            Messages tree
                                        </h2>
                                        <Modal icon="info" data={treeMessage} />
                                    </div>
                                </div>
                            </div>
                            {this.state.message?.parentMessageIds && this.state.childrenIds && (
                                <MessageTree
                                    parentsIds={this.state.message?.parentMessageIds}
                                    messageId={this.props.match.params.messageId}
                                    childrenIds={this.state.childrenIds}
                                    onSelected={async (i, update) => this.loadMessage(i, update)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div >
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
    private calculateStatus(metadata?: IMessageMetadata): TangleStatus {
        let messageTangleStatus: TangleStatus = "unknown";

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

    /**
     * Load the message with the given id.
     * @param messageId The index to load.
     * @param updateUrl Update the url.
     */
    private async loadMessage(messageId: string, updateUrl: boolean): Promise<void> {
        const result = await this._tangleCacheService.search(
            this.props.match.params.network, messageId);

        if (result?.message) {
            const message = result.message;
            if (!updateUrl) {
                window.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: "smooth"
                });
            }

            const { inputs, outputs, unlockAddresses, transferTotal } =
                await TransactionsHelper.getInputsAndOutputs(message,
                    this.props.match.params.network,
                    this._bechHrp,
                    this._tangleCacheService);
            let transactionId;

            if (message.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                transactionId = TransactionsHelper.computeTransactionIdFromTransactionPayload(
                    message.payload
                );
            }

            this.setState({
                inputs,
                outputs,
                unlockAddresses,
                transferTotal,
                transactionId
            });

            this.setState({
                actualMessageId: result.includedMessageId ?? messageId,
                message
            }, async () => {
                await this.updateMessageDetails();
            });
            if (updateUrl) {
                window.history.pushState(undefined, window.document.title, `/${this.props.match.params.network
                    }/message/${result.includedMessageId ?? messageId}`);
            }
        } else {
            this.props.history.replace(`/${this.props.match.params.network
                }/search/${messageId}`);
        }
    }
}

export default Message;

