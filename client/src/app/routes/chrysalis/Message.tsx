import { CONFLICT_REASON_STRINGS, Converter, Ed25519Address, ED25519_ADDRESS_TYPE, IMessage, IMessageMetadata, INDEXATION_PAYLOAD_TYPE, IReferenceUnlockBlock, ISignatureUnlockBlock, IUTXOInput, MILESTONE_PAYLOAD_TYPE, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE, SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE, SIG_LOCKED_SINGLE_OUTPUT_TYPE, TRANSACTION_PAYLOAD_TYPE, UnitsHelper, WriteStream } from "@iota/iota.js";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import { MessageTangleStatus } from "../../../models/messageTangleStatus";
import { NetworkService } from "../../../services/networkService";
import { SettingsService } from "../../../services/settingsService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import IndexationPayload from "../../components/chrysalis/IndexationPayload";
import MilestonePayload from "../../components/chrysalis/MilestonePayload";
import ReceiptPayload from "../../components/chrysalis/ReceiptPayload";
import TransactionPayload from "../../components/chrysalis/TransactionPayload";
import FiatValue from "../../components/FiatValue";
import InclusionState from "../../components/InclusionState";
import MessageButton from "../../components/MessageButton";
import MessageTangleState from "../../components/MessageTangleState";
import Modal from "../../components/Modal";
import { ModalIcon } from "../../components/ModalProps";
import Spinner from "../../components/Spinner";
import Switcher from "../../components/Switcher";
import messageJSON from "./../../../assets/modals/message.json";
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
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of Message.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<MessageRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
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

        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.messageId);

        if (result?.message) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            window.history.replaceState(undefined, window.document.title, `/${this.props.match.params.network
                }/message/${result.includedMessageId ?? this.props.match.params.messageId}`);

            await this.getInputsAndOutputs(result?.message);

            this.setState({
                paramMessageId: this.props.match.params.messageId,
                actualMessageId: result.includedMessageId ?? this.props.match.params.messageId,
                message: result.message
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
                        <div className="message--header ">
                            <div className="row middle">
                                <h1>
                                    Message
                                </h1>
                                <Modal icon={ModalIcon.Dots} data={messageJSON} />
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
                            <div className="section--header row space-between">
                                <div className="row middle">
                                    <h2>General</h2>
                                    <Modal icon={ModalIcon.Info} data={messageJSON} />
                                </div>

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
                            <div className="section--data">
                                <div className="label">
                                    Message ID
                                </div>
                                <div className="value code highlight row middle">
                                    <span className="margin-r-t">
                                        {this.state.actualMessageId}
                                    </span>
                                    <MessageButton
                                        onClick={() => ClipboardHelper.copy(
                                            this.state.actualMessageId
                                        )}
                                        buttonType="copy"
                                        labelPosition="top"
                                    />
                                </div>
                            </div>

                            {this.state.paramMessageId !== this.state.actualMessageId && (
                                <div className="section--data">
                                    <div className="label">
                                        Transaction Id
                                    </div>
                                    <div className="value value__secondary row middle">
                                        <span className="margin-r-t">{this.state.paramMessageId}</span>
                                        <MessageButton
                                            onClick={() => ClipboardHelper.copy(
                                                this.state.paramMessageId
                                            )}
                                            buttonType="copy"
                                            labelPosition="top"
                                        />
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
                                this.state.transferTotal && (
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
                                    this.state.transferTotal &&
                                    (
                                        <div className="section">
                                            <TransactionPayload
                                                network={this.props.match.params.network}
                                                history={this.props.history}
                                                inputs={this.state.inputs}
                                                outputs={this.state.outputs}
                                                transferTotal={this.state.transferTotal}
                                            />

                                            {this.state.message.payload.essence.payload && (
                                                <div className="section">
                                                    <IndexationPayload
                                                        network={this.props.match.params.network}
                                                        history={this.props.history}
                                                        payload={this.state.message.payload.essence.payload}
                                                        advancedMode={this.state.advancedMode}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                            <Modal icon={ModalIcon.Info} data={messageJSON} />
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
                                <div className="row middle">
                                    <h2>
                                        Messages tree
                                    </h2>
                                    <Modal icon={ModalIcon.Info} data={messageJSON} />
                                </div>
                            </div>
                            <div className="section--data">
                                <div className="section--header">
                                    <h3>Parent Messages</h3>
                                    {this.state !== undefined && (
                                        <span className="messages--number">
                                            {this.state.message?.parentMessageIds?.length}
                                        </span>
                                    )}
                                </div>
                                <div className="section--data">
                                    {this.state.message?.parentMessageIds?.map((parent, idx) => (
                                        <React.Fragment key={idx}>
                                            <div
                                                className="value code highlight
                                                           row middle"
                                            >
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
                                </div>
                                <div className="section--header">
                                    <h3>Child Messages</h3>
                                    {this.state.childrenIds !== undefined && (
                                        <span className="messages--number">
                                            {this.state.childrenIds.length}
                                        </span>
                                    )}
                                </div>
                                <div className="section--data">
                                    {this.state.childrenBusy && (<Spinner />)}
                                    {this.state.childrenIds?.map(childId => (
                                        <div
                                            className="value
                                                         code highlight row middle"
                                            key={childId}
                                        >
                                            <Link
                                                className="margin-r-t"
                                                to={
                                                    `/${this.props.match.params.network
                                                    }/message/${childId}`
                                                }
                                            >
                                                {childId}
                                            </Link>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(
                                                    childId
                                                )}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </div>
                                    ))}
                                    {!this.state.childrenBusy &&
                                        this.state.childrenIds &&
                                        this.state.childrenIds.length === 0 && (
                                            <p>There are no children for this message.</p>
                                        )}
                                </div>
                            </div>
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

    /**
     * Get inputs and outputs for the message.
     * @param transactionMessage The message to get inputs and outputs.
     */
    private async getInputsAndOutputs(transactionMessage: IMessage): Promise<void> {
        if (transactionMessage?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
            const inputs: (IUTXOInput & {
                outputHash: string;
                isGenesis: boolean;
                transactionUrl: string;
                transactionAddress: IBech32AddressDetails;
                signature: string;
                publicKey: string;
                amount: number;
            })[] = [];
            const outputs = [];
            let transferTotal = 0;
            const unlockAddresses: IBech32AddressDetails[] = [];


            const GENESIS_HASH = "0".repeat(64);

            const signatureBlocks: ISignatureUnlockBlock[] = [];
            for (let i = 0; i < transactionMessage.payload.unlockBlocks.length; i++) {
                if (transactionMessage.payload.unlockBlocks[i].type === SIGNATURE_UNLOCK_BLOCK_TYPE) {
                    const sigUnlockBlock = transactionMessage.payload.unlockBlocks[i] as ISignatureUnlockBlock;
                    signatureBlocks.push(sigUnlockBlock);
                } else if (transactionMessage.payload.unlockBlocks[i].type === REFERENCE_UNLOCK_BLOCK_TYPE) {
                    const refUnlockBlock = transactionMessage.payload.unlockBlocks[i] as IReferenceUnlockBlock;
                    signatureBlocks.push(
                        transactionMessage.payload.unlockBlocks[refUnlockBlock.reference] as ISignatureUnlockBlock
                    );
                }
            }

            for (let i = 0; i < signatureBlocks.length; i++) {
                unlockAddresses.push(
                    Bech32AddressHelper.buildAddress(
                        this._bechHrp,
                        Converter.bytesToHex(
                            new Ed25519Address(Converter.hexToBytes(signatureBlocks[i].signature.publicKey))
                                .toAddress()
                        ),
                        signatureBlocks[i].type === SIGNATURE_UNLOCK_BLOCK_TYPE
                            ? ED25519_ADDRESS_TYPE : undefined
                    )
                );
            }

            for (let i = 0; i < transactionMessage.payload.essence.inputs.length; i++) {
                const input = transactionMessage.payload.essence.inputs[i];
                const isGenesis = input.transactionId === GENESIS_HASH;
                const writeOutputStream = new WriteStream();
                writeOutputStream.writeUInt16("transactionOutputIndex", input.transactionOutputIndex);
                const outputHash = input.transactionId + writeOutputStream.finalHex();
                const transactionOutputIndex = input.transactionOutputIndex;
                const transactionResult = await this._tangleCacheService.search(
                    this.props.match.params.network, input.transactionId);
                let amount = 0;
                if (transactionResult?.message && transactionResult?.message.payload?.type ===
                    TRANSACTION_PAYLOAD_TYPE) {
                    amount = transactionResult.message.payload?.essence.outputs[transactionOutputIndex].amount;
                }
                inputs.push({
                    ...input,
                    amount,
                    isGenesis,
                    outputHash,
                    transactionUrl: `/${this.props.match.params.network}/search/${outputHash}`,
                    transactionAddress: unlockAddresses[i],
                    signature: signatureBlocks[i].signature.signature,
                    publicKey: signatureBlocks[i].signature.publicKey
                });
            }

            let remainderIndex = 1000;
            for (let i = 0; i < transactionMessage.payload.essence.outputs.length; i++) {
                if (transactionMessage.payload.essence.outputs[i].type === SIG_LOCKED_SINGLE_OUTPUT_TYPE ||
                    transactionMessage.payload.essence.outputs[i].type === SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE) {
                    const address = Bech32AddressHelper.buildAddress(
                        this._bechHrp,
                        transactionMessage.payload.essence.outputs[i].address.address,
                        transactionMessage.payload.essence.outputs[i].address.type);
                    const isRemainder = inputs.some(input => input.transactionAddress.bech32 === address.bech32);
                    outputs.push({
                        index: isRemainder ? (remainderIndex++) + i : i,
                        type: transactionMessage.payload.essence.outputs[i].type,
                        address,
                        amount: transactionMessage.payload.essence.outputs[i].amount,
                        isRemainder
                    });
                    if (!isRemainder) {
                        transferTotal += transactionMessage.payload.essence.outputs[i].amount;
                    }
                }
            }

            for (let i = 0; i < inputs.length; i++) {
                const outputResponse = await this._tangleCacheService.outputDetails(
                    this.props.match.params.network, inputs[i].outputHash
                );

                if (outputResponse?.output) {
                    inputs[i].transactionAddress = Bech32AddressHelper.buildAddress(
                        this._bechHrp,
                        outputResponse.output.address.address,
                        outputResponse.output.address.type
                    );
                    inputs[i].transactionUrl =
                        `/${this.props.match.params.network}/message/${outputResponse.messageId}`;
                }
            }

            outputs.sort((a, b) => a.index - b.index);


            this.setState({
                inputs,
                outputs,
                unlockAddresses,
                transferTotal
            }, async () => {
                await this.updateMessageDetails();
            });
        }
    }
}

export default Message;
