import { FeatureType, IssuerFeature, MetadataFeature, SenderFeature, TagFeature } from "@iota/iota.js-stardust";
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
                    {NameHelper.getFeatureTypeName(feature.getType(), isImmutable)}
                </div>
            </div>
            {isExpanded && (
                <div className="padding-l-t left-border">
                    {feature.getType() === FeatureType.Sender && (
                        <Address
                            address={(feature as SenderFeature).getSender()}
                        />
                    )}
                    {feature.getType() === FeatureType.Issuer && (
                        <Address
                            address={(feature as IssuerFeature).getIssuer()}
                        />
                    )}
                    {feature.getType() === FeatureType.Metadata && (
                        <div className="card--value row">
                            <DataToggle
                                sourceData={(feature as MetadataFeature).getData()}
                                withSpacedHex={true}
                                isParticipationEventMetadata={isParticipationEventMetadata}
                            />
                        </div>
                    )}
                    {feature.getType() === FeatureType.Tag && (
                        <div>
                            {(feature as TagFeature).getTag() && (
                                <DataToggle
                                    sourceData={(feature as TagFeature).getTag()}
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
