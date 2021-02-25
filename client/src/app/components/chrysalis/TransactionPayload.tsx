/* eslint-disable max-len */
import { Converter, Ed25519Address, ED25519_ADDRESS_TYPE, IReferenceUnlockBlock, ISignatureUnlockBlock, IUTXOInput, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE, SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE, SIG_LOCKED_SINGLE_OUTPUT_TYPE, UnitsHelper, UTXO_INPUT_TYPE, WriteStream } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { NameHelper } from "../../../helpers/nameHelper";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import { NetworkService } from "../../../services/networkService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../AsyncComponent";
import MessageButton from "../MessageButton";
import Bech32Address from "./Bech32Address";
import { TransactionPayloadProps } from "./TransactionPayloadProps";
import { TransactionPayloadState } from "./TransactionPayloadState";

/**
 * Component which will display a transaction payload.
 */
class TransactionPayload extends AsyncComponent<TransactionPayloadProps, TransactionPayloadState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of TransactionPayload.
     * @param props The props.
     */
    constructor(props: TransactionPayloadProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.network
            ? networkService.get(this.props.network)
            : undefined;

        this._bechHrp = networkConfig?.bechHrp ?? "iota";

        const inputs: (IUTXOInput & {
            outputHash: string;
            isGenesis: boolean;
            transactionUrl: string;
            transactionAddress: IBech32AddressDetails;
        })[] = [];

        const GENESIS_HASH = "0".repeat(64);

        const signatureBlocks: ISignatureUnlockBlock[] = [];
        for (let i = 0; i < props.payload.unlockBlocks.length; i++) {
            if (props.payload.unlockBlocks[i].type === SIGNATURE_UNLOCK_BLOCK_TYPE) {
                const sigUnlockBlock = props.payload.unlockBlocks[i] as ISignatureUnlockBlock;
                signatureBlocks.push(sigUnlockBlock);
            } else if (props.payload.unlockBlocks[i].type === REFERENCE_UNLOCK_BLOCK_TYPE) {
                const refUnlockBlock = props.payload.unlockBlocks[i] as IReferenceUnlockBlock;
                signatureBlocks.push(props.payload.unlockBlocks[refUnlockBlock.reference] as ISignatureUnlockBlock);
            }
        }

        const unlockAddresses: IBech32AddressDetails[] = [];
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

        for (let i = 0; i < props.payload.essence.inputs.length; i++) {
            const input = props.payload.essence.inputs[i];
            const isGenesis = input.transactionId === GENESIS_HASH;
            const writeStream = new WriteStream();
            writeStream.writeUInt16("transactionOutputIndex", input.transactionOutputIndex);
            const outputHash = input.transactionId + writeStream.finalHex();
            inputs.push({
                ...input,
                isGenesis,
                outputHash,
                transactionUrl: `/${this.props.network}/search/${outputHash}`,
                transactionAddress: unlockAddresses[i]
            });
        }

        this.state = {
            formatFull: false,
            inputs,
            unlockAddresses
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const inputs = this.state.inputs;

        for (let i = 0; i < this.state.inputs.length; i++) {
            const outputResponse = await this._tangleCacheService.outputDetails(this.props.network, this.state.inputs[i].outputHash);

            if (outputResponse?.output) {
                inputs[i].transactionAddress = Bech32AddressHelper.buildAddress(
                    this._bechHrp,
                    outputResponse.output.output.address.address,
                    outputResponse.output.output.address.type
                );
                inputs[i].transactionUrl = `/${this.props.network}/message/${outputResponse.output.messageId}`;
            }
        }

        this.setState({
            inputs
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="transaction-payload">
                <div className="card">
                    <div className="card--header">
                        <h2>Inputs</h2>
                    </div>
                    <div className="card--content">
                        {this.state.inputs.map((input, idx) => (
                            <div
                                key={idx}
                                className="card--inline-row"
                            >
                                <h3 className="margin-b-t">{NameHelper.getInputTypeName(input.type)} {idx}</h3>
                                {input.type === UTXO_INPUT_TYPE && (
                                    <React.Fragment>
                                        <Bech32Address
                                            network={this.props.network}
                                            history={this.props.history}
                                            addressDetails={input.transactionAddress}
                                        />
                                        <div className="card--label">
                                            Transaction Id
                                        </div>
                                        <div className="card--value row middle">
                                            {!input.isGenesis && (
                                                <React.Fragment>
                                                    <Link
                                                        to={input.transactionUrl}
                                                        className="margin-r-t"
                                                    >
                                                        {input.transactionId}
                                                    </Link>
                                                    <MessageButton
                                                        onClick={() => ClipboardHelper.copy(
                                                            input.transactionId
                                                        )}
                                                        buttonType="copy"
                                                        labelPosition="top"
                                                    />
                                                </React.Fragment>

                                            )}
                                            {input.isGenesis && "Genesis"}
                                        </div>
                                        <div className="card--label">
                                            Transaction Output Index
                                        </div>
                                        <div className="card--value">
                                            {input.transactionOutputIndex}
                                        </div>
                                    </React.Fragment>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card--header">
                        <h2>Outputs</h2>
                    </div>
                    <div className="card--content">
                        {this.props.payload.essence.outputs.map((output, idx) => (
                            <div
                                key={idx}
                                className="card--inline-row"
                            >
                                <h3 className="margin-b-t">{NameHelper.getOutputTypeName(output.type)} {idx}</h3>
                                {(output.type === SIG_LOCKED_SINGLE_OUTPUT_TYPE ||
                                    output.type === SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE) && (
                                        <React.Fragment>
                                            <Bech32Address
                                                network={this.props.network}
                                                history={this.props.history}
                                                addressDetails={Bech32AddressHelper.buildAddress(
                                                    this._bechHrp,
                                                    output.address.address,
                                                    output.address.type)}
                                            />

                                            <div className="card--label">
                                                Amount
                                            </div>
                                            <div className="card--value">
                                                <button
                                                    type="button"
                                                    onClick={() => this.setState(
                                                        {
                                                            formatFull: !this.state.formatFull
                                                        }
                                                    )}
                                                >
                                                    {this.state.formatFull
                                                        ? `${output.amount} i`
                                                        : UnitsHelper.formatBest(output.amount)}
                                                </button>
                                            </div>
                                        </React.Fragment>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card--header">
                        <h2>Unlock Blocks</h2>
                    </div>
                    <div className="card--content">
                        {this.props.payload.unlockBlocks.map((unlockBlock, idx) => (
                            <div
                                key={idx}
                                className="card--inline-row"
                            >
                                <h3 className="margin-b-t">{NameHelper.getUnlockBlockTypeName(unlockBlock.type)} {idx}</h3>
                                {unlockBlock.type === SIGNATURE_UNLOCK_BLOCK_TYPE && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Public Key
                                        </div>
                                        <div className="card--value row middle">
                                            <span className="margin-r-t">{unlockBlock.signature.publicKey}</span>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(unlockBlock.signature.publicKey)}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </div>
                                        <div className="card--label">
                                            Signature
                                        </div>
                                        <div className="card--value">
                                            {unlockBlock.signature.signature}
                                        </div>
                                        <Bech32Address
                                            network={this.props.network}
                                            history={this.props.history}
                                            addressDetails={this.state.unlockAddresses[idx]}
                                        />
                                    </React.Fragment>
                                )}
                                {unlockBlock.type === REFERENCE_UNLOCK_BLOCK_TYPE && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Reference
                                        </div>
                                        <div className="card--value">
                                            {unlockBlock.reference}
                                        </div>
                                    </React.Fragment>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default TransactionPayload;
