/* eslint-disable max-len */
import { Converter, Ed25519Address, ED25519_ADDRESS_TYPE, IReferenceUnlockBlock, ISignatureUnlockBlock, IUTXOInput, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE, SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE, SIG_LOCKED_SINGLE_OUTPUT_TYPE, UnitsHelper, WriteStream } from "@iota/iota.js";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import { NetworkService } from "../../../services/networkService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../AsyncComponent";
import CurrencyButton from "../CurrencyButton";
import ValueButton from "../ValueButton";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
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
            signature: string;
            publicKey: string;
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
                transactionAddress: unlockAddresses[i],
                signature: signatureBlocks[i].signature.signature,
                publicKey: signatureBlocks[i].signature.publicKey
            });
        }

        const outputs = [];
        let remainderIndex = 1000;
        let transferTotal = 0;
        for (let i = 0; i < props.payload.essence.outputs.length; i++) {
            if (props.payload.essence.outputs[i].type === SIG_LOCKED_SINGLE_OUTPUT_TYPE ||
                props.payload.essence.outputs[i].type === SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE) {
                const address = Bech32AddressHelper.buildAddress(
                    this._bechHrp,
                    props.payload.essence.outputs[i].address.address,
                    props.payload.essence.outputs[i].address.type);
                const isRemainder = inputs.some(input => input.transactionAddress.bech32 === address.bech32);
                outputs.push({
                    index: isRemainder ? (remainderIndex++) + i : i,
                    type: props.payload.essence.outputs[i].type,
                    address,
                    amount: props.payload.essence.outputs[i].amount,
                    isRemainder
                });
                if (!isRemainder) {
                    transferTotal += props.payload.essence.outputs[i].amount;
                }
            }
        }

        outputs.sort((a, b) => a.index - b.index);

        this.state = {
            formatFull: false,
            inputs,
            outputs,
            unlockAddresses,
            transferTotal,
            showInputDetails: -1,
            showOutputDetails: -1
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
                    outputResponse.output.address.address,
                    outputResponse.output.address.type
                );
                inputs[i].transactionUrl = `/${this.props.network}/message/${outputResponse.messageId}`;
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
            <React.Fragment>
                {this.state.transferTotal !== 0 && (
                    // <div className="card margin-b-s">
                    //     <div className="card--content">
                    //         <div className="row fill margin-t-s margin-b-s value-buttons">
                    //             <div className="col">
                    //                 <ValueButton value={this.state.transferTotal} />
                    //             </div>
                    //             <div className="col">
                    //                 <CurrencyButton
                    //                     marketsRoute={
                    //                         `/${this.props.network}/markets`
                    //                     }
                    //                     value={this.state.transferTotal}
                    //                 />
                    //             </div>
                    //             BALANCE: {UnitsHelper.formatUnits(this.state.transferTotal, UnitsHelper.calculateBest(this.state.transferTotal))}
                    //         </div>
                    //     </div>
                    // </div>
                    <div className="section--content">
                        <div className="section--label">
                            Value
                        </div>
                        <div className="section--value row middle">
                            <span>
                                {UnitsHelper.formatUnits(this.state.transferTotal, UnitsHelper.calculateBest(this.state.transferTotal))}
                            </span>
                        </div>
                    </div>
                )}
                <div className="row row--tablet-responsive fill stretch transaction-simple">
                    <div className="card col fill">
                        <div className="card--header">
                            <h2 className="card--header__title">From</h2>
                        </div>
                        <div className="card--content">
                            {this.state.inputs.map((input, idx) => (
                                <React.Fragment key={idx}>
                                    <div
                                        className="card--content__input"
                                        onClick={() => this.setState({ showInputDetails: this.state.showInputDetails === idx ? -1 : idx })}
                                    >
                                        <div className={classNames("margin-r-t", "card--content__input--dropdown", { opened: this.state.showInputDetails === idx })}>
                                            <DropdownIcon />
                                        </div>
                                        <Bech32Address
                                            network={this.props.network}
                                            history={this.props.history}
                                            addressDetails={input.transactionAddress}
                                            advancedMode={false}
                                            hideLabel={true}
                                            truncateAddress={true}
                                        />
                                    </div>
                                    {this.state.showInputDetails === idx
                                        ? (
                                            <React.Fragment>
                                                <div className="card--label"> Address</div>
                                                <div className="card--value">
                                                    <Bech32Address
                                                        network={this.props.network}
                                                        history={this.props.history}
                                                        addressDetails={input.transactionAddress}
                                                        advancedMode={true}
                                                        hideLabel={true}
                                                        truncateAddress={false}
                                                    />
                                                </div>
                                                <div className="card--label"> Message id</div>
                                                <div className="card--value">
                                                    <Link
                                                        to={input.transactionUrl}
                                                        className="margin-r-t"
                                                    >
                                                        {input.transactionId}
                                                    </Link>
                                                </div>
                                                <div className="card--label"> Signature</div>
                                                <div className="card--value">{input.signature}</div>
                                                <div className="card--label"> Public Key</div>
                                                <div className="card--value">{input.publicKey}</div>
                                            </React.Fragment>) : ""}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <div className="card col fill">
                        <div className="card--header">
                            <h2 className="card--header__title">To</h2>
                        </div>
                        <div className="card--content">
                            {this.state.outputs.map((output, idx) => (
                                <React.Fragment key={idx}>
                                    <div
                                        className="card--content__input card--content__flex_between"
                                        onClick={() => this.setState({ showOutputDetails: this.state.showOutputDetails === idx ? -1 : idx })}
                                    >
                                        <div className={classNames("margin-r-t", "card--content__input--dropdown", { opened: this.state.showOutputDetails === idx })}>
                                            <DropdownIcon />
                                        </div>
                                        <Bech32Address
                                            network={this.props.network}
                                            history={this.props.history}
                                            addressDetails={output.address}
                                            advancedMode={false}
                                            hideLabel={true}
                                            truncateAddress={true}
                                        />
                                        <div className="card--value">
                                            {UnitsHelper.formatBest(output.amount)}
                                        </div>
                                        {this.state.showOutputDetails === idx
                                            ? (
                                                <React.Fragment>
                                                    <div className="card--label"> Address</div>
                                                    <div className="card--value">
                                                        <Bech32Address
                                                            network={this.props.network}
                                                            history={this.props.history}
                                                            addressDetails={output.address}
                                                            advancedMode={true}
                                                            hideLabel={true}
                                                            truncateAddress={false}
                                                        />
                                                    </div>
                                                </React.Fragment>) : ""}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div >
            </React.Fragment >
        );
    }
}

export default TransactionPayload;
