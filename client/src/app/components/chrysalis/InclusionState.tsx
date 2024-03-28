import { LedgerInclusionState } from "@iota/sdk-wasm-stardust/web";
import React, { Component, ReactNode } from "react";

interface InclusionStateProps {
    /**
     * The inclusion state.
     */
    readonly state?: LedgerInclusionState;
}

/**
 * Component which will display the inclusion state.
 */
class InclusionState extends Component<InclusionStateProps> {
    /**
     * The default props.
     */
    public static defaultProps: InclusionStateProps = {
        state: undefined,
    };

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="inclusion-state">
                {this.props.state === undefined && "The message is not yet referenced by a milestone."}
                {this.props.state === "included" && "The message is referenced by a milestone, the transaction is included in the ledger."}
                {this.props.state === "noTransaction" &&
                    "The message is referenced by a milestone, the data is included in the ledger" + ", but there is no value transfer."}
                {this.props.state === "conflicting" && "The message has a conflict and will not be included in the ledger."}
            </div>
        );
    }
}

export default InclusionState;
