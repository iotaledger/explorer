import { AliasOutput, FoundryOutput, NftOutput } from "@iota/iota.js-stardust";
import { optional } from "@ruffy/ts-optional";
import React from "react";
import Feature from "../../Feature";

interface FeaturesSectionProps {
    /**
     * The Output
     */
    output?: NftOutput | AliasOutput | FoundryOutput;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ output }) => (
    <React.Fragment>
        {optional(output?.getFeatures()).nonEmpty() && (
            <div className="section">
                <div className="section--header row row--tablet-responsive middle space-between">
                    <div className="row middle">
                        <h2>Features</h2>
                    </div>
                </div>
                {output?.getFeatures()?.map((feature, idx) => (
                    <Feature key={idx} feature={feature} isPreExpanded={true} isImmutable={false} />
                ))}
            </div>
        )}
        {optional(output?.getImmutableFeatures()).nonEmpty() && (
            <div className="section">
                <div className="section--header row row--tablet-responsive middle space-between">
                    <div className="row middle">
                        <h2>Immutable features</h2>
                    </div>
                </div>
                {output?.getImmutableFeatures()?.map((feature, idx) => (
                    <Feature key={idx} feature={feature} isPreExpanded={true} isImmutable={true} />
                ))}
            </div>
        )}
    </React.Fragment>
);

FeaturesSection.defaultProps = {
    output: undefined
};

export default FeaturesSection;
