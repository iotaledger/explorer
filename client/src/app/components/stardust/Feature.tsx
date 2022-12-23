import { ISSUER_FEATURE_TYPE, METADATA_FEATURE_TYPE, SENDER_FEATURE_TYPE, TAG_FEATURE_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { ReactComponent as DropdownIcon } from "../../../assets/dropdown-arrow.svg";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import AsyncComponent from "../AsyncComponent";
import DataToggle from "../DataToggle";
import Address from "./Address";
import { FeatureProps } from "./FeatureProps";
import { FeatureState } from "./FeatureState";
/**
 * Component which will display an Feature Block.
 */
class FeatureBlock extends AsyncComponent<FeatureProps, FeatureState> {
    constructor(props: FeatureProps) {
        super(props);

        this.state = {
            isExpanded: this.props.isPreExpanded ?? false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const isExpanded = this.state.isExpanded;
        const { feature, isImmutable } = this.props;

        return (
            <div className="feature-block">
                <div
                    className="card--content__input card--value row middle"
                    onClick={() => this.setState({ isExpanded: !isExpanded })}
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
    }
}

export default FeatureBlock;
