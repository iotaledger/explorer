import React, { Component, ReactNode } from "react";
import "./ToolsPanel.scss";
import { ToolsPanelProps } from "./ToolsPanelProps";

/**
 * Component which will show the side tools component.
 */
class ToolsPanel extends Component<ToolsPanelProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="toolspanel card">
                <div className="card--header">
                    <h2>Tools</h2>
                </div>
                <div className="card--sections">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default ToolsPanel;
