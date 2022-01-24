import { UnitsHelper } from "@iota/iota.js";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";
import MessageTangleState from "../MessageTangleState";
import "./Transaction.scss";
import { TransactionProps } from "./TransactionProps";
import { TransactionState } from "./TransactionState";


/**
 * Component which will display a transaction.
 */
class Transaction extends Component<TransactionProps, TransactionState> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            this.props.tableFormat ? (
                <tr>
                    <td className="value code highlight">
                        <Link
                            to={
                                `/${this.props.network
                                }/message/${this.props.messageId}`
                            }
                            className="margin-r-t"
                        >
                            {this.props.messageId.slice(0, 12)}...{this.props.messageId.slice(-12)}
                        </Link>
                    </td>
                    <td>{this.props.date
                        ? (this.props.date)
                        : <Spinner />}
                    </td>
                    <td>{this.props.inputs}</td>
                    <td>{this.props.outputs}</td>
                    <td>
                        {this.props.messageTangleStatus
                            ? (
                                <MessageTangleState
                                    network={this.props.network}
                                    status={this.props.messageTangleStatus}
                                />
                            )
                            : <Spinner />}
                    </td>
                    <td className={`amount ${this.props.amount && this.props.amount < 0 ? "negative" : "positive"}`}>
                        {this.props.amount ? UnitsHelper.formatBest(this.props.amount ?? 0) : <Spinner />}
                    </td>
                </tr>
            ) : (
                <div className="transaction-card">
                    <div className="field">
                        <div className="label">Message ID</div>
                        <div className="value message-id">
                            <Link
                                to={
                                    `/${this.props.network
                                    }/message/${this.props.messageId}`
                                }
                                className="margin-r-t"
                            >
                                {this.props.messageId.slice(0, 12)}...{this.props.messageId.slice(-12)}
                            </Link>
                        </div>
                    </div>
                    <div className="field">
                        <div className="label">Date</div>
                        <div className="value">{this.props.date
                            ? (this.props.date)
                            : <Spinner />}
                        </div>
                    </div>
                    <div className="field">
                        <div className="label">Inputs</div>
                        <div className="value">{this.props.inputs}</div>
                    </div>
                    <div className="field">
                        <div className="label">Outputs</div>
                        <div className="value">{this.props.outputs}</div>
                    </div>
                    <div className="field">
                        <div className="label">Status</div>
                        <div className="value">{this.props.messageTangleStatus
                            ? (
                                <MessageTangleState
                                    network={this.props.network}
                                    status={this.props.messageTangleStatus}
                                />
                            )
                            : <Spinner />}
                        </div>
                    </div>
                    <div className="field">
                        <div className="label">Amount</div>
                        <div className={`amount ${this.props.amount && this.props.amount < 0
                            ? "negative"
                            : "positive"}`}
                        >
                            {this.props.amount ? UnitsHelper.formatBest(this.props.amount ?? 0) : <Spinner />}
                        </div>
                    </div>
                </div >
            )
        );
    }
}

export default Transaction;
