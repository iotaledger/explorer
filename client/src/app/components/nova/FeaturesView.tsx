import {
    BlockIssuerFeature,
    Feature,
    FeatureType,
    IssuerFeature,
    MetadataFeature,
    NativeTokenFeature,
    SenderFeature,
    StakingFeature,
    TagFeature,
} from "@iota/sdk-wasm-nova/web";
// will this import work ? why isnt it exported from web ?
import { Ed25519BlockIssuerKey } from "@iota/sdk-wasm-nova/web/lib/types/block/output/block-issuer-key";
import classNames from "classnames";
import React, { useState } from "react";
import AddressView from "./AddressView";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import DataToggle from "../DataToggle";

interface FeatureViewProps {
    /**
     * The feature.
     */
    feature: Feature;

    /**
     * Is the feature pre-expanded.
     */
    isPreExpanded?: boolean;

    /**
     * Is the feature immutable.
     */
    isImmutable: boolean;
}

const FeatureView: React.FC<FeatureViewProps> = ({ feature, isImmutable, isPreExpanded }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(isPreExpanded ?? false);

    return (
        <div className="feature-block">
            <div className="card--content__input card--value row middle" onClick={() => setIsExpanded(!isExpanded)}>
                <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div className="card--label">{getFeatureTypeName(feature.type, isImmutable)}</div>
            </div>
            {isExpanded && (
                <div className="padding-l-t left-border">
                    {feature.type === FeatureType.Sender && <AddressView address={(feature as SenderFeature).address} />}
                    {feature.type === FeatureType.Issuer && <AddressView address={(feature as IssuerFeature).address} />}
                    {feature.type === FeatureType.Metadata && (
                        <div className="card--value row">
                            <DataToggle sourceData={(feature as MetadataFeature).data} withSpacedHex={true} />
                        </div>
                    )}
                    {feature.type === FeatureType.StateMetadata && <div className="card--value row">State metadata unimplemented</div>}
                    {feature.type === FeatureType.Tag && (
                        <div>
                            {(feature as TagFeature).tag && <DataToggle sourceData={(feature as TagFeature).tag} withSpacedHex={true} />}
                        </div>
                    )}
                    {feature.type === FeatureType.NativeToken && (
                        <div className="padding-l-t left-border">
                            <div className="card--label">Token id:</div>
                            <div className="card--value row">{(feature as NativeTokenFeature).id}</div>
                            <div className="card--label">Amount:</div>
                            <div className="card--value row">{Number((feature as NativeTokenFeature).amount)}</div>
                        </div>
                    )}
                    {feature.type === FeatureType.BlockIssuer && (
                        <div className="padding-l-t left-border">
                            <div className="card--label">Expiry Slot:</div>
                            <div className="card--value row">{(feature as BlockIssuerFeature).expirySlot}</div>
                            <div className="card--label">Block issuer keys:</div>
                            {Array.from((feature as BlockIssuerFeature).blockIssuerKeys).map((blockIssuerKey, idx) => (
                                <div key={idx} className="card--value row">
                                    {(blockIssuerKey as Ed25519BlockIssuerKey).publicKey}
                                </div>
                            ))}
                        </div>
                    )}
                    {feature.type === FeatureType.Staking && (
                        <div className="padding-l-t left-border">
                            <div className="card--label">Staked amount:</div>
                            <div className="card--value row">{Number((feature as StakingFeature).stakedAmount)}</div>
                            <div className="card--label">Fixed cost:</div>
                            <div className="card--value row">{Number((feature as StakingFeature).fixedCost)}</div>
                            <div className="card--label">Start epoch:</div>
                            <div className="card--value row">{Number((feature as StakingFeature).startEpoch)}</div>
                            <div className="card--label">End epoch:</div>
                            <div className="card--value row">{Number((feature as StakingFeature).endEpoch)}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function getFeatureTypeName(type: FeatureType, isImmutable: boolean): string {
    let name: string = "";

    switch (type) {
        case FeatureType.Sender:
            name = "Sender";
            break;
        case FeatureType.Issuer:
            name = "Issuer";
            break;
        case FeatureType.Metadata:
            name = "Metadata";
            break;
        case FeatureType.StateMetadata:
            name = "State Metadata";
            break;
        case FeatureType.Tag:
            name = "Tag";
            break;
        case FeatureType.NativeToken:
            name = "Native Token";
            break;
        case FeatureType.BlockIssuer:
            name = "Block Issuer";
            break;
        case FeatureType.Staking:
            name = "Staking";
            break;
    }

    if (name) {
        return isImmutable ? `Immutable ${name}` : name;
    }

    return "Unknown Feature";
}

export default FeatureView;
