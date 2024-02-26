import { AnchorOutput, FeatureType, StateMetadataFeature } from "@iota/sdk-wasm-nova/web";
import React from "react";
import DataToggle from "~/app/components/DataToggle";

interface AnchorStateSectionProps {
    /**
     * The Anchor Output
     */
    readonly output: AnchorOutput | null;
}

const AnchorStateSection: React.FC<AnchorStateSectionProps> = ({ output }) => {
    const stateMetadata = output?.features?.find((feature) => feature.type === FeatureType.StateMetadata) as StateMetadataFeature;

    return (
        <div className="section">
            <div className="section--data">
                <div>
                    <div className="label">State Index</div>
                    <div className="value row middle margin-t-t">
                        <span className="margin-r-t">{output?.stateIndex}</span>
                    </div>
                </div>
                {Object.entries(stateMetadata.entries).map(([key, value], index) => (
                    <div key={index}>
                        <div className="label margin-t-m">{key}</div>
                        <div className="value row middle margin-t-t">
                            <DataToggle sourceData={value} withSpacedHex={true} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnchorStateSection;
