import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./CopyButton.scss";
import { CopyButtonProps } from "./CopyButtonProps";
import { CopyButtonState } from "./CopyButtonState";

/**
 * Component which will display a copy button.
 */
class CopyButton extends Component<CopyButtonProps, CopyButtonState> {
    /**
     * Create a new instance of CopyButton.
     * @param props The props.
     */
    constructor(props: CopyButtonProps) {
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
            <div className="copy-button">
                <button
                    type="button"
                    className={classNames(
                        "copy-button-btn",
                        { "copy-button-btn--active": this.state.active }
                    )}
                    onClick={e => this.activate(e)}
                >
                    {this.props.buttonType === "copy" && (
                        <span className="material-icons">
                            content_copy
                        </span>
                    )}
                </button>
                {this.state.active && this.state.message && (
                    <span className={classNames("copy-button--message", this.props.labelPosition)}>
                        {this.state.message}
                    </span>
                )}
            </div>
        );
    }

    /**
     * Activate the button.
     * @param event The mouse click event
     */
    private activate(event: React.MouseEvent): void {
        this.props.onClick(event);

        this.setState({ active: true });
        setTimeout(
            () => {
                this.setState({ active: false });
            },
            2000);
    }
}

export default CopyButton;
