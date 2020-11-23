import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./InclusionState.scss";
import { InclusionStateProps } from "./InclusionStateProps";

/**
 * Component which will display the inclusion state.
 */
class InclusionState extends Component<InclusionStateProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div
                className={
                    classNames(
                        "inclusion-state",
                        { "inclusion__not-included": this.props.state === undefined },
                        { "inclusion__included": this.props.state === "included" },
                        { "inclusion__no-transaction": this.props.state === "noTransaction" },
                        { "inclusion__conflicting": this.props.state === "conflicting" }
                    )
                }
            >
                {this.props.state === undefined && ("Not included")}
                {this.props.state === "included" && ("Included")}
                {this.props.state === "noTransaction" && ("No Transaction")}
                {this.props.state === "conflicting" && ("Conflicting")}
            </div>
        );
    }
}

export default InclusionState;
