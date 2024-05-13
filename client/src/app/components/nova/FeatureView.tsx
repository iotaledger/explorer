import {
    BlockIssuerFeature,
    Ed25519PublicKeyHashBlockIssuerKey,
    Feature,
    FeatureType,
    IssuerFeature,
    MetadataFeature,
    NativeTokenFeature,
    SenderFeature,
    StakingFeature,
    TagFeature,
} from "@iota/sdk-wasm-nova/web";
import classNames from "classnames";
import React, { useState } from "react";
import AddressView from "./address/AddressView";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import DataToggle from "~/app/components/DataToggle";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import Tooltip from "~/app/components/Tooltip";
import { EPOCH_HINT } from "./OutputView";
import { NameHelper } from "~/helpers/nova/nameHelper";

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
    const { name: network, tokenInfo, manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
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
                    {feature.type === FeatureType.Sender && <AddressView address={(feature as SenderFeature).address} />}
                    {feature.type === FeatureType.Issuer && <AddressView address={(feature as IssuerFeature).address} />}
                    {feature.type === FeatureType.Metadata && (
                        <div className="card--value row">
                            {Object.entries((feature as MetadataFeature).entries).map(([key, value], index) => (
                                <div key={index}>
                                    <div className="card--label">{key}:</div>
                                    <div className="card--value row middle margin-t-t">
                                        <DataToggle sourceData={value} withSpacedHex={true} />
                                    </div>
                                </div>
                            ))}
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
                                    {(blockIssuerKey as Ed25519PublicKeyHashBlockIssuerKey).pubKeyHash}
                                </div>
                            ))}
                        </div>
                    )}
                    {feature.type === FeatureType.Staking && (
                        <div className="padding-l-t left-border">
                            <div className="card--label">Staked amount:</div>
                            <div className="card--value row">
                                {formatAmount((feature as StakingFeature).stakedAmount, tokenInfo, false)}
                            </div>
                            <div className="card--label">Fixed cost:</div>
                            <div className="card--value row">{formatAmount((feature as StakingFeature).fixedCost, manaInfo, false)}</div>
                            <div className="card--label">Start epoch:</div>
                            <div className="card--value row">
                                <TruncatedId
                                    id={String((feature as StakingFeature).startEpoch)}
                                    link={
                                        (feature as StakingFeature).startEpoch === 0
                                            ? undefined
                                            : `/${network}/epoch/${(feature as StakingFeature).startEpoch}`
                                    }
                                    showCopyButton={false}
                                />
                            </div>
                            <div className="card--label">End epoch:</div>
                            <div className="card--value row epoch-info epoch-info--above">
                                <TruncatedId
                                    id={String((feature as StakingFeature).endEpoch)}
                                    link={
                                        (feature as StakingFeature).endEpoch === 0
                                            ? undefined
                                            : `/${network}/epoch/${(feature as StakingFeature).endEpoch}`
                                    }
                                    showCopyButton={false}
                                />
                                {(feature as StakingFeature).endEpoch === 0 && (
                                    <Tooltip tooltipContent={EPOCH_HINT}>
                                        <div className="modal--icon margin-t-2">
                                            <span className="material-icons">info</span>
                                        </div>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeatureView;
