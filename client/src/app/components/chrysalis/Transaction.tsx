import { Converter, Ed25519Address, ED25519_ADDRESS_TYPE, IReferenceUnlockBlock, ISignatureUnlockBlock, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE, TRANSACTION_PAYLOAD_TYPE, UnitsHelper } from "@iota/iota.js";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import { NetworkService } from "../../../services/networkService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import Spinner from "../../components/Spinner";
import MessageTangleState from "../MessageTangleState";
import { DateHelper } from "./../../../helpers/dateHelper";
import { MessageTangleStatus } from "./../../../models/messageTangleStatus";
import "./Transaction.scss";
import { TransactionProps } from "./TransactionProps";
import { TransactionState } from "./TransactionState";


/**
 * Component which will display a transaction.
 */
class Transaction extends Component<TransactionProps, TransactionState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of Transaction.
     * @param props The props.
     */
    constructor(props: TransactionProps) {
        super(props);
        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.network
            ? networkService.get(this.props.network)
            : undefined;

        this._bechHrp = networkConfig?.bechHrp ?? "iota";
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        const currentAddress = this.props.output.output.address;

        const messageResult = await this._tangleCacheService.search(
            this.props.network, this.props.output.messageId);

        const unlockAddresses: IBech32AddressDetails[] = [];


        if (messageResult?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
            const signatureBlocks: ISignatureUnlockBlock[] = [];
            for (let i = 0; i < messageResult.message.payload.unlockBlocks.length; i++) {
                if (messageResult.message.payload.unlockBlocks[i].type === SIGNATURE_UNLOCK_BLOCK_TYPE) {
                    const sigUnlockBlock = messageResult.message.payload.unlockBlocks[i] as ISignatureUnlockBlock;
                    signatureBlocks.push(sigUnlockBlock);
                } else if (messageResult.message.payload.unlockBlocks[i].type === REFERENCE_UNLOCK_BLOCK_TYPE) {
                    const refUnlockBlock = messageResult.message.payload.unlockBlocks[i] as IReferenceUnlockBlock;
                    signatureBlocks.push(
                        messageResult.message.payload.unlockBlocks[refUnlockBlock.reference] as ISignatureUnlockBlock
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

            const inputs = messageResult?.message?.payload?.essence.inputs;
            const outputs = messageResult?.message?.payload?.essence.outputs;
            let inputsAmount = 0;
            let outputsAmount = 0;
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                const transactionAddress = unlockAddresses[i];

                if (transactionAddress?.hex === currentAddress.address) {
                    const transactionOutputIndex = input.transactionOutputIndex;
                    const transactionResult = await this._tangleCacheService.search(
                        this.props.network, input.transactionId);
                    if (transactionResult?.message && transactionResult?.message.payload?.type ===
                        TRANSACTION_PAYLOAD_TYPE) {
                        inputsAmount +=
                            transactionResult.message.payload?.essence.outputs[transactionOutputIndex].amount;
                    }
                }
            }
            for (let i = 0; i < outputs.length; i++) {
                const output = outputs[i];
                if (output.address.address === currentAddress.address) {
                    outputsAmount += output.amount;
                }
            }
            const amount = outputsAmount - inputsAmount;

            this.setState({
                inputs: inputs.length,
                outputs: outputs.length,
                amount
            });

            const details = await this._tangleCacheService.messageDetails(
                this.props.network, this.props.output.messageId ?? "");
            if (details) {
                let messageTangleStatus: MessageTangleStatus = "unknown";

                if (details?.metadata) {
                    if (details.metadata.milestoneIndex) {
                        messageTangleStatus = "milestone";
                    } else if (details.metadata.referencedByMilestoneIndex) {
                        messageTangleStatus = "referenced";
                    } else {
                        messageTangleStatus = "pending";
                    }

                    this.setState({
                        messageTangleStatus
                    });
                }
                const milestoneIndex = details?.metadata?.referencedByMilestoneIndex;
                if (milestoneIndex) {
                    const result = await this._tangleCacheService.milestoneDetails(
                        this.props.network, milestoneIndex);
                    if (result?.timestamp) {
                        this.setState({
                            date: DateHelper.formatShort(DateHelper.milliseconds(result.timestamp))
                        });
                    }
                }
            }
        }
    }


    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            (this.props.filterValue === "all" ||
                (this.props.filterValue === "incoming" && this.state && this.state.amount > 0) ||
                (this.props.filterValue === "outgoing" && this.state && this.state.amount < 0)) && (
                <tr>
                    <td className="section--value section--value__code featured">
                        <Link
                            to={
                                `/${this.props.network
                                }/message/${this.props.output.messageId}`
                            }
                            className="margin-r-t"
                        >
                            {this.props.output.messageId.slice(0, 12)}...{this.props.output.messageId.slice(-12)}
                        </Link>
                    </td>
                    <td>{this.state?.date ?? <Spinner />}</td>
                    <td>{this.state?.inputs ?? <Spinner />}</td>
                    <td>{this.state?.outputs ?? <Spinner />}</td>
                    <td>
                        {this.state?.messageTangleStatus
                            ? (
                                <MessageTangleState
                                    network={this.props.network}
                                    status={this.state.messageTangleStatus}
                                />
                            )
                            : <Spinner />}
                    </td>
                    <td className={`amount ${this.state?.amount < 0 ? "negative" : "positive"}`}>
                        {UnitsHelper.formatBest(this.state?.amount)}
                    </td>
                </tr>
            )

        );
    }
}

export default Transaction;
