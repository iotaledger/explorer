import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./Spinner.scss";
import { SpinnerProps } from "./SpinnerProps";

/**
 * Component which will display a spinner.
 */
class Spinner extends Component<SpinnerProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className={
                classNames("spinner", { "spinner--compact": this.props.compact })
            }
            />
        );
    }
}

export default Spinner;
