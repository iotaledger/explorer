import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./Confirmation.scss";
import { ConfirmationProps } from "./ConfirmationProps";

/**
 * Component which will display a confirmation.
 */
class Confirmation extends Component<ConfirmationProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <span
                className={
                    classNames(
                        "confirmation",
                        { "confirmation__confirmed": this.props.state === "confirmed" },
                        { "confirmation__pending": this.props.state === "pending" },
                        { "confirmation__reattachment": this.props.state === "reattachment" },
                        { "confirmation__consistency": this.props.state === "consistency" }
                    )
                }
            >
                {this.props.state === "unknown" && ("Unknown")}
                {this.props.state === "confirmed" && ("Confirmed")}
                {this.props.state === "pending" && ("Pending")}
                {this.props.state === "subtangle" && ("Subtangle not updated")}
                {this.props.state === "reattachment" && ("Reattachment Confirmed")}
                {this.props.state === "consistency" && ("Invalid Consistency")}
            </span>
        );
    }
}

export default Confirmation;
