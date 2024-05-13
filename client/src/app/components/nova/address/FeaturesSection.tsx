import { AccountOutput, FoundryOutput, NftOutput } from "@iota/sdk-wasm-nova/web";
import { optional } from "@ruffy/ts-optional";
import React from "react";
import FeatureView from "../FeatureView";

interface FeaturesSectionProps {
    /**
     * The Output
     */
    readonly output?: NftOutput | AccountOutput | FoundryOutput;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ output }) => (
    <React.Fragment>
        {optional(output?.features).nonEmpty() && (
            <div className="section">
                <div className="section--header row row--tablet-responsive middle space-between">
                    <div className="row middle">
                        <h2>Features</h2>
                    </div>
                </div>
                {output?.features?.map((feature, idx) => (
                    <FeatureView key={idx} feature={feature} isPreExpanded={true} isImmutable={false} />
                ))}
            </div>
        )}
        {optional(output?.immutableFeatures).nonEmpty() && (
            <div className="section">
                <div className="section--header row row--tablet-responsive middle space-between">
                    <div className="row middle">
                        <h2>Immutable features</h2>
                    </div>
                </div>
                {output?.immutableFeatures?.map((feature, idx) => (
                    <FeatureView key={idx} feature={feature} isPreExpanded={true} isImmutable={true} />
                ))}
            </div>
        )}
    </React.Fragment>
);

FeaturesSection.defaultProps = {
    output: undefined,
};

export default FeaturesSection;
