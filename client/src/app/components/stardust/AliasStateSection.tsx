import { IAliasOutput } from "@iota/iota.js-stardust";
import React from "react";
import DataToggle from "../DataToggle";
import Modal from "../Modal";
import stateMessage from "./../../../assets/modals/stardust/alias/state.json";

interface AliasStateSectionProps {
    /**
     * The Alias Output
     */
    output?: IAliasOutput;
}

const AliasStateSection: React.FC<AliasStateSectionProps> = ({ output }) => (
    <div className="section">
        <div className="section--header">
            <div className="row middle">
                <h2>State</h2>
                <Modal icon="info" data={stateMessage} />
            </div>
        </div>
        <div className="section--data">
            <div>
                <div className="label">State Index</div>
                <div className="value row middle margin-t-t">
                    <span className="margin-r-t">{output?.stateIndex}</span>
                </div>
            </div>
            {output?.stateMetadata && (
                <div>
                    <div className="label margin-t-m">State Metadata</div>
                    <div className="value row middle margin-t-t">
                        <DataToggle
                            sourceData={output?.stateMetadata}
                            withSpacedHex={true}
                        />
                    </div>
                </div>
            )}
        </div>
    </div>
);

AliasStateSection.defaultProps = {
    output: undefined
};

export default AliasStateSection;
