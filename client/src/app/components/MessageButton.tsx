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
            active: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <React.Fragment>
                <button
                    type="button"
                    className="message-button"
                    onClick={() => this.activate()}
                >
                    {this.props.children}
                </button>
                {this.state.active && (
                    <span className="message-button--message">
                        {this.props.message}
                    </span>
                )}
            </React.Fragment>
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
