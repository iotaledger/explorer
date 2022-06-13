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
                        <span className="material-icons">
                            content_copy
                        </span>
                    )}
                </button>
                {this.state.active && this.state.message && (
                    <span className={classNames("message-button--message", this.props.labelPosition)}>
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
