/* eslint-disable react/static-property-placement */
/* eslint-disable max-len */
import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import React, { Component, ReactNode } from "react";
import { ReceiptPayloadProps } from "./ReceiptPayloadProps";
import { Bech32AddressHelper } from "~helpers/stardust/bech32AddressHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "../../../../context/NetworkContext";
import { ReceiptPayloadState } from "../../../ReceiptPayloadState";
import Bech32Address from "../../address/Bech32Address";

/**
 * Component which will display a receipt payload.
 */
class ReceiptPayload extends Component<ReceiptPayloadProps, ReceiptPayloadState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * Create a new instance of ReceiptPayload.
     * @param props The props.
     */
    constructor(props: ReceiptPayloadProps) {
        super(props);

        this.state = {
            formatFull: false,
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const bech32Hrp: string = this.context.bech32Hrp;
        const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;

        return (
            <div className="indexation-payload card">
                <div className="card--header">
                    <h2>Receipt Payload</h2>
                </div>
                <div className="card--content">
                    <div className="card--label">Migrated At</div>
                    <div className="card--value">{this.props.payload.migratedAt}</div>
                    <div className="card--label">Final</div>
                    <div className="card--value">
                        <div className="margin-b-m">{this.props.payload.final ? "Yes" : "No"}</div>
                    </div>
                    {this.props.payload.funds.map((f, idx) => (
                        <div key={idx} className="margin-b-s">
                            <h3 className="margin-b-t">Migrated Fund {idx}</h3>
                            <div className="card--label">Tail Transaction Hash</div>
                            <div className="card--value card--value__mono">{f.tailTransactionHash}</div>
                            <div className="card--value card--value__mono">
                                <Bech32Address
                                    addressDetails={Bech32AddressHelper.buildAddress(bech32Hrp, f.address)}
                                    advancedMode={this.props.advancedMode}
                                    history={this.props.history}
                                    network={this.props.network}
                                />
                            </div>
                            <div className="card--label">Deposit</div>
                            <div className="card--value card--value__mono">
                                <button
                                    className="card--value--button"
                                    type="button"
                                    onClick={() =>
                                        this.setState({
                                            formatFull: !this.state.formatFull,
                                        })
                                    }
                                >
                                    {formatAmount(Number(f.deposit), tokenInfo, this.state.formatFull)}
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="card--label">Input Transaction Milestone Id</div>
                    <div className="card--value card--value__mono">{this.props.payload.transaction.input.milestoneId}</div>
                    <div className="card--label">Output Transaction Amount to Treasury</div>
                    <div className="card--value card--value__mono">
                        <button
                            className="card--value--button"
                            type="button"
                            onClick={() =>
                                this.setState({
                                    formatFull: !this.state.formatFull,
                                })
                            }
                        >
                            {formatAmount(Number(this.props.payload.transaction.output.amount), tokenInfo, this.state.formatFull)}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ReceiptPayload;
