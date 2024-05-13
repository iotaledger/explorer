import { FeatureType, IssuerFeature, MetadataFeature, SenderFeature, TagFeature } from "@iota/sdk-wasm-stardust/web";
import classNames from "classnames";
import React, { useState } from "react";
import Address from "./address/Address";
import { FeatureProps } from "./FeatureProps";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import { NameHelper } from "~helpers/stardust/nameHelper";
import DataToggle from "../DataToggle";

const Feature: React.FC<FeatureProps> = ({ feature, isImmutable, isPreExpanded, isParticipationEventMetadata }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(isPreExpanded ?? false);
    return (
        <div className="feature-block">
            <div className="card--content__input card--value row middle" onClick={() => setIsExpanded(!isExpanded)}>
                <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div className="card--label">{NameHelper.getFeatureTypeName(feature.type, isImmutable)}</div>
            </div>
            {isExpanded && (
                <div className="padding-l-t left-border">
                    {feature.type === FeatureType.Sender && <Address address={(feature as SenderFeature).address} />}
                    {feature.type === FeatureType.Issuer && <Address address={(feature as IssuerFeature).address} />}
                    {feature.type === FeatureType.Metadata && (
                        <div className="card--value row">
                            <DataToggle
                                sourceData={(feature as MetadataFeature).data}
                                withSpacedHex={true}
                                isParticipationEventMetadata={isParticipationEventMetadata}
                            />
                        </div>
                    )}
                    {feature.type === FeatureType.Tag && (
                        <div>
                            {(feature as TagFeature).tag && <DataToggle sourceData={(feature as TagFeature).tag} withSpacedHex={true} />}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Feature;
