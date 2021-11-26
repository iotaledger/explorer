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
        console.log("TRANSACTION COMP");
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
                    <td className={`amount ${this.state?.amount < 0 ? "negative" : "positive"}`}>
                        {UnitsHelper.formatBest(this.state?.amount)}
                    </td>
                </tr>
            )
        );
    }
}

export default Transaction;
