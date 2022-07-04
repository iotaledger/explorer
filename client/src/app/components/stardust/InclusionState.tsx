import { LedgerInclusionState } from "@iota/iota.js-stardust";
import React from "react";

export interface InclusionStateProps {
    /**
     * The inclusion state.
     */
    state?: LedgerInclusionState;
}

const InclusionState: React.FC<InclusionStateProps> = ({ state }) => (
    <div className="inclusion-state">
        {state === undefined && ("The block is not yet referenced by a milestone.")}
        {state === "included" && (
            "The block is referenced by a milestone, the transaction is included in the ledger."
        )}
        {state === "noTransaction" && (
            "The block is referenced by a milestone, the data is included in the ledger" +
                ", but there is no value transfer."
        )}
        {state === "conflicting" && (
            "The block has a conflict and will not be included in the ledger."
        )}
    </div>
);


InclusionState.defaultProps = { state: undefined };

export default InclusionState;

