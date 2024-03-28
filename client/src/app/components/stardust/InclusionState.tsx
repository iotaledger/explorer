import { LedgerInclusionState } from "@iota/sdk-wasm-stardust/web";
import React from "react";

interface InclusionStateProps {
    /**
     * The inclusion state.
     */
    readonly state?: LedgerInclusionState;
}

const InclusionState: React.FC<InclusionStateProps> = ({ state }) => (
    <div className="inclusion-state">
        {state === undefined && "The block is not yet referenced by a milestone."}
        {state === "included" && "The block is confirmed by a milestone and the transaction successfully mutated the ledger state."}
        {state === "noTransaction" && "The block is referenced by a milestone but there is no value transfer."}
        {state === "conflicting" && "The block is confirmed by a milestone but the transaction is conflicting."}
    </div>
);

InclusionState.defaultProps = { state: undefined };

export default InclusionState;
