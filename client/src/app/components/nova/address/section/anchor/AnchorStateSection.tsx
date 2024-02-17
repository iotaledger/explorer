import { AnchorOutput } from "@iota/sdk-wasm-nova/web";
import React from "react";

interface AnchorStateSectionProps {
    /**
     * The Anchor Output
     */
    readonly output: AnchorOutput | null;
}

const AnchorStateSection: React.FC<AnchorStateSectionProps> = ({ output }) => {
    // const stateMetadataFeature = output?.features.find(feature => feature.type === FeatureType.StateMetadata) as StateMetadataFeature;

    return (
        <div className="section">
            <div className="section--data">
                <div>
                    <div className="label">State Index</div>
                    <div className="value row middle margin-t-t">
                        <span className="margin-r-t">{output?.stateIndex}</span>
                    </div>
                </div>
                {/* {stateMetadata && (
                    <div>
                        <div className="label margin-t-m">State Metadata</div>
                        <div className="value row middle margin-t-t">
                            <DataToggle sourceData={stateMetadata} withSpacedHex={true} />
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default AnchorStateSection;
