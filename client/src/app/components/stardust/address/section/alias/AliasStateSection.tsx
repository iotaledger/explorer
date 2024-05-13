import { AliasOutput } from "@iota/sdk-wasm-stardust/web";
import React from "react";
import DataToggle from "../../../../DataToggle";

interface AliasStateSectionProps {
    /**
     * The Alias Output
     */
    readonly output: AliasOutput | null;
}

const AliasStateSection: React.FC<AliasStateSectionProps> = ({ output }) => {
    const stateMetadata = output?.stateMetadata;

    return (
        <div className="section">
            <div className="section--data">
                <div>
                    <div className="label">State Index</div>
                    <div className="value row middle margin-t-t">
                        <span className="margin-r-t">{output?.stateIndex}</span>
                    </div>
                </div>
                {stateMetadata && (
                    <div>
                        <div className="label margin-t-m">State Metadata</div>
                        <div className="value row middle margin-t-t">
                            <DataToggle sourceData={stateMetadata} withSpacedHex={true} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AliasStateSection;
