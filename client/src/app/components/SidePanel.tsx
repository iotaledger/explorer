import React, { ReactNode } from "react";
import AsyncComponent from "./AsyncComponent";
import "./SidePanel.scss";
import { SidePanelProps } from "./SidePanelProps";
import { SidePanelState } from "./SidePanelState";

/**
 * Component which will show the side panel component.
 */
class SidePanel extends AsyncComponent<SidePanelProps, SidePanelState> {
    /**
     * Create a new instance of SidePanel.
     * @param props The props.
     */
    constructor(props: SidePanelProps) {
        super(props);

        this.state = {
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="side-panel card">
                <div className="card--header">
                    <h2>Stats</h2>
                </div>
            </div>
        );
    }
}

export default SidePanel;
