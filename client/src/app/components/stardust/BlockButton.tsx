/* eslint-disable max-len */
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./BlockButton.scss";
import { BlockButtonProps } from "./BlockButtonProps";
import { BlockButtonState } from "./BlockButtonState";

/**
 * Component which will display a block button.
 */
class BlockButton extends Component<BlockButtonProps, BlockButtonState> {
    /**
     * Create a new instance of MessageButton.
     * @param props The props.
     */
    constructor(props: BlockButtonProps) {
        super(props);

        this.state = {
            active: false,
            block: props.buttonType === "copy" ? "Copied" : ""
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="block-button">
                <button
                    type="button"
                    className={classNames(
                        "block-button-btn",
                        { "block-button-btn--active": this.state.active }
                    )}
                    onClick={() => this.activate()}
                >
                    {this.props.buttonType === "copy" && (
                        <span className="material-icons">
                            content_copy
                        </span>
                    )}
                </button>
                {this.state.active && this.state.block && (
                    <span className="block-button--block">
                        {this.state.block}
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

export default BlockButton;
