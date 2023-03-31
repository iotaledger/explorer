import { ISSUER_FEATURE_TYPE, METADATA_FEATURE_TYPE, SENDER_FEATURE_TYPE, TAG_FEATURE_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { useState } from "react";
import { ReactComponent as DropdownIcon } from "../../../assets/dropdown-arrow.svg";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import DataToggle from "../DataToggle";
import Address from "./address/Address";
import { FeatureProps } from "./FeatureProps";

const Feature: React.FC<FeatureProps> = (
    { feature, isImmutable, isPreExpanded, isParticipationEventMetadata }
) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(isPreExpanded ?? false);

    return (
        <div className="feature-block">
            <div
                className="card--content__input card--value row middle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={classNames("margin-r-t", "card--content--dropdown",
                    { opened: isExpanded })}
                >
                    <DropdownIcon />
                </div>
                <div className="card--label">
                    {NameHelper.getFeatureTypeName(feature.type, isImmutable)}
                </div>
            </div>
            {isExpanded && (
                <div className="padding-l-t left-border">
                    {feature.type === SENDER_FEATURE_TYPE && (
                        <Address
                            address={feature.address}
                        />
                    )}
                    {feature.type === ISSUER_FEATURE_TYPE && (
                        <Address
                            address={feature.address}
                        />
                    )}
                    {feature.type === METADATA_FEATURE_TYPE && (
                        <div className="card--value row">
                            <DataToggle
                                sourceData={feature.data}
                                withSpacedHex={true}
                                isParticipationEventMetadata
                            />
                        </div>
                    )}
                    {feature.type === TAG_FEATURE_TYPE && (
                        <div>
                            {feature.tag && (
                                <DataToggle
                                    sourceData={feature.tag}
                                    withSpacedHex={true}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Feature;
