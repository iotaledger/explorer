/* eslint-disable max-len */
import { Converter, Ed25519Address, IReferenceUnlockBlock, ISignatureUnlockBlock, UnitsHelper } from "@iota/iota.js";
import React, { Component, ReactNode } from "react";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import Bech32Address from "./Bech32Address";
import { TransactionPayloadProps } from "./TransactionPayloadProps";
import { TransactionPayloadState } from "./TransactionPayloadState";

/**
 * Component which will display a transaction payload.
 */
class TransactionPayload extends Component<TransactionPayloadProps, TransactionPayloadState> {
    /**
     * Create a new instance of TransactionPayload.
     * @param props The props.
     */
    constructor(props: TransactionPayloadProps) {
        super(props);

        const signatureBlocks: ISignatureUnlockBlock[] = [];
        for (let i = 0; i < props.payload.unlockBlocks.length; i++) {
            if (props.payload.unlockBlocks[i].type === 0) {
                const sigUnlockBlock = props.payload.unlockBlocks[i] as ISignatureUnlockBlock;
                signatureBlocks.push(sigUnlockBlock);
            } else {
                const refUnlockBlock = props.payload.unlockBlocks[i] as IReferenceUnlockBlock;
                signatureBlocks.push(props.payload.unlockBlocks[refUnlockBlock.reference] as ISignatureUnlockBlock);
            }
        }

        const unlockAddresses: IBech32AddressDetails[] = [];
        for (let i = 0; i < signatureBlocks.length; i++) {
            unlockAddresses.push(
                Bech32AddressHelper.buildAddress(
                    Converter.bytesToHex(
                        new Ed25519Address().publicKeyToAddress(
                            Converter.hexToBytes(
                                signatureBlocks[i].signature.publicKey)
                        )
                    )
                )
            );
        }

        this.state = {
            formatFull: false,
            unlockAddresses
        };
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
                        {this.props.payload.essence.inputs.map((input, idx) => (
                            <div
                                key={idx}
                                className="card--inline-row"
                            >
                                <h3 className="margin-b-t">Input {idx}</h3>
                                <Bech32Address
                                    network={this.props.network}
                                    history={this.props.history}
                                    addressDetails={this.state.unlockAddresses[idx]}
                                />
                                <div className="card--label">
                                    Transaction Id
                                </div>
                                <div className="card--value">
                                    {input.transactionId}
                                </div>
                                <div className="card--label">
                                    Transaction Output Index
                                </div>
                                <div className="card--value">
                                    {input.transactionOutputIndex}
                                </div>
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
                                <h3 className="margin-b-t">Output {idx}</h3>

                                <Bech32Address
                                    network={this.props.network}
                                    history={this.props.history}
                                    addressDetails={Bech32AddressHelper.buildAddress(output.address.address)}
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
                                <h3 className="margin-b-t">Unlock Block {idx}</h3>
                                {unlockBlock.type === 0 && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Public Key
                                        </div>
                                        <div className="card--value">
                                            {unlockBlock.signature.publicKey}
                                        </div>
                                        <div className="card--label">
                                            Signature
                                        </div>
                                        <div className="card--value">
                                            {unlockBlock.signature.signature}
                                        </div>
                                    </React.Fragment>
                                )}
                                {unlockBlock.type === 1 && (
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
