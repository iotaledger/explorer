import React, { Component, ReactNode } from "react";
import "./Transaction.scss";
import { ActivityProps } from "./ActivityProps";

/**
 * Component which will display an activity.
 */
class Activity extends Component<ActivityProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            this.props.tableFormat ? (
                <tr>
                    <td className="value code highlight">
                        {this.props.hash}
                    </td>
                    <td className="date">{this.props.date}</td>
                    <td className="date">{this.props.action}</td>
                    <td><span className="status">{this.props.status}</span></td>
                    <td className="price">{this.props.price}</td>
                </tr>
            ) : (
                <div className="transaction-card">
                    <div className="field">
                        <div className="label">T'XN Hash</div>
                        <div className="value message-id">
                            {this.props.hash}
                        </div>
                    </div>
                    <div className="field">
                        <div className="label">Date</div>
                        <div className="value">{this.props.date}
                        </div>
                    </div>
                    <div className="field">
                        <div className="label">Action</div>
                        <div className="value">{this.props.action}</div>
                    </div>
                    <div className="field">
                        <div className="label">Status</div>
                        <div className="value">{this.props.status}</div>
                    </div>
                    <div className="field">
                        <div className="label">Price</div>
                        <div className="value">{this.props.price}
                        </div>
                    </div>
                </div>
            )
        );
    }
}

export default Activity;
