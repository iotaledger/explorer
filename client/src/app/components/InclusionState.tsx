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
            <div className="inclusion-state">
                <div
                    className={
                        classNames(
                            "inclusion-state-pill",
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
                {this.props.state === undefined && ("The message is not yet referenced by a milestone.")}
                {this.props.state === "included" && (
                    "The message is referenced by a milestone, the transaction is included in the ledger."
                )}
                {this.props.state === "noTransaction" && (
                    "The message is referenced by a milestone, the data is included in the ledger" +
                    ", but there is no value transfer."
                )}
                {this.props.state === "conflicting" && (
                    "The message has a conflict and will not be included in the ledger."
                )}
            </div>
        );
    }
}

export default InclusionState;
