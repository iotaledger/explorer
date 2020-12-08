import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./MessageTangleState.scss";
import { MessageTangleStateProps } from "./MessageTangleStateProps";

/**
 * Component which will display a message tangle state.
 */
class MessageTangleState extends Component<MessageTangleStateProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div
                onClick={this.props.onClick}
                className={
                    classNames(
                        "message-tangle-state",
                        { "message-tangle-state__no-click": !this.props.onClick },
                        { "message-tangle-state__referenced": this.props.status === "referenced" },
                        { "message-tangle-state__milestone": this.props.status === "milestone" },
                        { "message-tangle-state__pending": this.props.status === "pending" },
                        { "message-tangle-state__unknown": this.props.status === "unknown" }
                    )
                }
            >
                {this.props.status === "unknown" && ("Unknown")}
                {this.props.status === "referenced" &&
                    (`Referenced${this.props.milestoneIndex !== undefined && this.props.milestoneIndex > 1
                        ? ` by MS ${this.props.milestoneIndex}` : ""}`)}
                {this.props.status === "milestone" &&
                    (`MS${this.props.milestoneIndex !== undefined ? ` ${this.props.milestoneIndex}` : ""}`)}
                {this.props.status === "pending" && ("Pending")}
            </div>
        );
    }
}

export default MessageTangleState;
