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
            (
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
                    <td>{this.props.date}</td>
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
                    <td>{this.props.isSpent !== undefined ? (this.props.isSpent ? "YES" : "NO") : "-"}</td>
                </tr>
            )
        );
    }
}

export default Transaction;
