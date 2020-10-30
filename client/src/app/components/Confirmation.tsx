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
            <button
                type="button"
                onClick={this.props.onClick}
                className={
                    classNames(
                        "confirmation",
                        { "confirmation__no-click": !this.props.onClick },
                        { "confirmation__confirmed": this.props.state === "confirmed" },
                        { "confirmation__pending": this.props.state === "pending" },
                        { "confirmation__unknown": this.props.state === "unknown" },
                        { "confirmation__reattachment": this.props.state === "reattachment" },
                        { "confirmation__consistency": this.props.state === "consistency" },
                        { "confirmation__conflicting": this.props.state === "conflicting" }
                    )
                }
            >
                {this.props.state === "unknown" && ("Unknown")}
                {this.props.state === "confirmed" &&
                    (`Confirmed${this.props.milestoneIndex !== undefined && this.props.milestoneIndex > 1
                        ? ` by MS ${this.props.milestoneIndex}` : ""}`)}
                {this.props.state === "pending" && ("Pending")}
                {this.props.state === "subtangle" && ("Subtangle not updated")}
                {this.props.state === "reattachment" && ("Reattachment Confirmed")}
                {this.props.state === "consistency" && ("Invalid Consistency")}
                {this.props.state === "conflicting" &&
                    (`Conflicting${this.props.milestoneIndex !== undefined && this.props.milestoneIndex < 0
                        ? ` at MS ${this.props.milestoneIndex}` : ""}`)}
            </button>
        );
    }
}

export default Confirmation;
