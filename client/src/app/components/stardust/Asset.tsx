import React, { Component, ReactNode } from "react";
import "./Transaction.scss";
import { AssetProps } from "./AssetProps";

/**
 * Component which will display an asset.
 */
class Asset extends Component<AssetProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            this.props.tableFormat ? (
                <tr>
                    <td className="value code highlight">
                        {this.props.asset}
                    </td>
                    <td>{this.props.symbol}</td>
                    <td>{this.props.quantity}</td>
                    <td>{this.props.price}</td>
                    <td>{this.props.value}</td>
                </tr>
            ) : (
                <div className="transaction-card">
                    <div className="field">
                        <div className="label">Asset</div>
                        <div className="value message-id">
                            {this.props.asset}
                        </div>
                    </div>
                    <div className="field">
                        <div className="label">Symbol</div>
                        <div className="value">{this.props.symbol}
                        </div>
                    </div>
                    <div className="field">
                        <div className="label">Quantity</div>
                        <div className="value">{this.props.quantity}</div>
                    </div>
                    <div className="field">
                        <div className="label">Price</div>
                        <div className="value">{this.props.price}</div>
                    </div>
                    <div className="field">
                        <div className="label">Value</div>
                        <div className="value">{this.props.value}
                        </div>
                    </div>
                </div >
            )
        );
    }
}

export default Asset;
