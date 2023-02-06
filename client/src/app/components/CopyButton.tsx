import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { ClipboardHelper } from "../../helpers/clipboardHelper";
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
            active: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="copy-button">
                {!this.state.active ? (
                    <button
                        type="button"
                        className={classNames("copy-button-btn", { "copy-button-btn--active": this.state.active })}
                        onClick={e => this.activate(e)}
                    >
                        <span className="material-icons">
                            content_copy
                        </span>
                    </button>
                ) : (
                    <div className="copy-button--message">
                        <span className="material-icons">done</span>
                    </div>
                )}
            </div>
        );
    }

    /**
     * Activate the button.
     * @param event The mouse click event
     */
    private activate(event: React.MouseEvent): void {
        ClipboardHelper.copy(this.props.copy);
        if (event) {
            event.stopPropagation();
        }

        this.setState({ active: true });
        setTimeout(
            () => {
                this.setState({ active: false });
            },
            2000);
    }
}

export default CopyButton;
