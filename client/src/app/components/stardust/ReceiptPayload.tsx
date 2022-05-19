/* eslint-disable max-len */
import React, { Component, ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { NetworkService } from "../../../services/networkService";
import NetworkContext from "../../context/NetworkContext";
import { ReceiptPayloadState } from "../ReceiptPayloadState";
import Bech32Address from "./Bech32Address";
import { ReceiptPayloadProps } from "./ReceiptPayloadProps";

/**
 * Component which will display a receipt payload.
 */
class ReceiptPayload extends Component<ReceiptPayloadProps, ReceiptPayloadState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The bech32 hrp from the node.
     */
    private readonly _bech32Hrp: string;

    /**
     * Create a new instance of ReceiptPayload.
     * @param props The props.
     */
    constructor(props: ReceiptPayloadProps) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.network
            ? networkService.get(this.props.network)
            : undefined;

        this._bech32Hrp = networkConfig?.bechHrp ?? "iota";

        this.state = {
            formatFull: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="indexation-payload">
                <div className="card--header">
                    <h2>Receipt Payload</h2>
                </div>
                <div className="card--content">
                    <div className="card--label">
                        Migrated At
                    </div>
                    <div className="card--value">
                        {this.props.payload.migratedAt}
                    </div>
                    <div className="card--label">
                        Final
                    </div>
                    <div className="card--value">
                        <div className="margin-b-m">
                            {this.props.payload.final ? "Yes" : "No"}
                        </div>
                    </div>
                    {this.props.payload.funds.map((f, idx) => (
                        <div
                            key={idx}
                            className="margin-b-s"
                        >
                            <h3 className="margin-b-t">Migrated Fund {idx}</h3>
                            <div className="card--label">
                                Tail Transaction Hash
                            </div>
                            <div className="card--value card--value__mono">
                                {f.tailTransactionHash}
                            </div>
                            <div className="card--value card--value__mono">
                                <Bech32Address
                                    addressDetails={
                                        Bech32AddressHelper.buildAddress(this._bech32Hrp, f.address)
                                    }
                                    advancedMode={this.props.advancedMode}
                                    history={this.props.history}
                                    network={this.props.network}
                                />
                            </div>
                            <div className="card--label">
                                Deposit
                            </div>
                            <div className="card--value card--value__mono">
                                <button
                                    className="card--value--button"
                                    type="button"
                                    onClick={() => this.setState(
                                        {
                                            formatFull: !this.state.formatFull
                                        }
                                    )}
                                >
                                    {
                                        formatAmount(
                                            Number(f.deposit),
                                            this.context.tokenInfo,
                                            this.state.formatFull
                                        )
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="card--label">
                        Input Transaction Milestone Id
                    </div>
                    <div className="card--value card--value__mono">
                        {this.props.payload.transaction.input.milestoneId}
                    </div>
                    <div className="card--label">
                        Output Transaction Amount to Treasury
                    </div>
                    <div className="card--value card--value__mono">
                        <button
                            className="card--value--button"
                            type="button"
                            onClick={() => this.setState(
                                {
                                    formatFull: !this.state.formatFull
                                }
                            )}
                        >
                            {
                                formatAmount(
                                    Number(this.props.payload.transaction.output.amount),
                                    this.context.tokenInfo,
                                    this.state.formatFull
                                )
                            }
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ReceiptPayload;

