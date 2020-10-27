/* eslint-disable max-len */
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./MessageButton.scss";
import { MessageButtonProps } from "./MessageButtonProps";
import { MessageButtonState } from "./MessageButtonState";

/**
 * Component which will display a message button.
 */
class MessageButton extends Component<MessageButtonProps, MessageButtonState> {
    /**
     * Create a new instance of MessageButton.
     * @param props The props.
     */
    constructor(props: MessageButtonProps) {
        super(props);

        this.state = {
            active: false,
            message: props.buttonType === "copy" ? "Copied" : ""
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="message-button">
                <button
                    type="button"
                    className={classNames(
                        "message-button-btn",
                        { "message-button-btn--active": this.state.active }
                    )}
                    onClick={() => this.activate()}
                >
                    {this.props.buttonType === "copy" && (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 9 1 L 16 1 C 16.552 1 17 1.448 17 2 L 17 9 C 17 9.552 16.552 10 16 10 L 9 10 C 8.448 10 8 9.552 8 9 L 8 2 C 8 1.448 8.448 1 9 1 Z" stroke="currentColor" strokeWidth="2" />
                            <path d=" M 5.125 6 L 4 6 C 2.895 6 2 6.895 2 8 L 2 14 C 2 15.105 2.895 16 4 16 L 10 16 C 11.105 16 12 15.105 12 14 L 12 12.875" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    )}
                </button>
                {this.state.active && this.state.message && (
                    <span
                        className={classNames(
                            "message-button--message",
                            { "message-button--message--right": this.props.labelPosition === "right" },
                            { "message-button--message--top": this.props.labelPosition === "top" }
                        )}
                    >
                        {this.state.message}
                    </span>
                )}
            </div>
        );
    }

    /**
     * Activate the button.
     */
    private activate(): void {
        this.props.onClick();

        this.setState({ active: true });
        setTimeout(
            () => {
                this.setState({ active: false });
            },
            2000);
    }
}

export default MessageButton;
