import { AliasOutput } from "@iota/iota.js-stardust";
import React from "react";
import DataToggle from "../../../../DataToggle";

interface AliasStateSectionProps {
    /**
     * The Alias Output
     */
    output: AliasOutput | null;
}

const AliasStateSection: React.FC<AliasStateSectionProps> = ({ output }) => {
    const stateMetadata = output?.getStateMetadata();

    return (
        <div className="section">
            <div className="section--data">
                <div>
                    <div className="label">State Index</div>
                    <div className="value row middle margin-t-t">
                        <span className="margin-r-t">{output?.getStateIndex()}</span>
                    </div>
                </div>
                {stateMetadata && (
                    <div>
                        <div className="label margin-t-m">State Metadata</div>
                        <div className="value row middle margin-t-t">
                            <DataToggle
                                sourceData={stateMetadata}
                                withSpacedHex={true}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AliasStateSection;

