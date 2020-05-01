import React, { Component, ReactNode } from "react";
import "./Spinner.scss";

/**
 * Component which will display a spinner.
 */
class Spinner extends Component {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="spinner" />
        );
    }
}

export default Spinner;
