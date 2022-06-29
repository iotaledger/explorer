import { ISSUER_FEATURE_TYPE, METADATA_FEATURE_TYPE, SENDER_FEATURE_TYPE, TAG_FEATURE_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { ReactComponent as DropdownIcon } from "../../../assets/dropdown-arrow.svg";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import AsyncComponent from "../AsyncComponent";
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
        return (
            <div className="feature-block">
                <div
                    className="card--content__input card--value row middle"
                    onClick={() => this.setState({ isExpanded: !this.state.isExpanded })}
                >
                    <div className={classNames("margin-r-t", "card--content--dropdown",
                        { opened: this.state.isExpanded })}
                    >
                        <DropdownIcon />
                    </div>
                    <div className="card--label">
                        {NameHelper.getFeatureTypeName(this.props.feature.type)}
                    </div>
                </div>
                {this.state.isExpanded && (
                    <div className="margin-l-t">
                        {this.props.feature.type === SENDER_FEATURE_TYPE && (
                            <Address
                                address={this.props.feature.address}
                            />
                        )}
                        {this.props.feature.type === ISSUER_FEATURE_TYPE && (
                            <Address
                                address={this.props.feature.address}
                            />
                        )}
                        {this.props.feature.type === METADATA_FEATURE_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Data:
                                </div>
                                <div className="card--value row">
                                    {this.props.feature.data}
                                </div>
                            </React.Fragment>
                        )}
                        {this.props.feature.type === TAG_FEATURE_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Tag:
                                </div>
                                <div className="card--value row">
                                    {this.props.feature.tag}
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default FeatureBlock;
