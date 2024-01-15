import React, { Component, ReactNode } from "react";
import "./Switcher.scss";
import { SwitcherProps } from "./SwitcherProps";

/**
 * Component which will show the switcher component.
 */
class Switcher extends Component<SwitcherProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="switch-wrapper">
                <span>{this.props.label}</span>
                <label className="switch">
                    <input type="checkbox" className="margin-l-t" checked={this.props.checked} onChange={this.props.onToggle} />
                    <span className="slider" />
                </label>
            </div>
        );
    }
}

export default Switcher;
