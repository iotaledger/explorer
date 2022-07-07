import { ISSUER_FEATURE_TYPE, METADATA_FEATURE_TYPE, SENDER_FEATURE_TYPE, TAG_FEATURE_TYPE } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
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
        this.setState(this.loadPayload());
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const TOGGLE_TAG_OPTIONS = [
            {
                label: this.state.tagJson ? "JSON" : "Text",
                content: this.state.tagJson ?? this.state.tagUtf8,
                isJson: this.state.tagJson !== undefined
            },
            {
                label: "HEX",
                content: this.state.tagHex
            }
        ];
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
                            <div>
                                {TOGGLE_TAG_OPTIONS.some(option => option.content !== undefined) && (
                                    <DataToggle
                                        options={TOGGLE_TAG_OPTIONS}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    /**
     * Load index and data from payload.
     * @returns Object with indexes and data in raw and utf-8 format.
     */
     private loadPayload() {
        let tagHex;
        let tagUtf8;
        let tagJson;

        if (this.props.feature.type === TAG_FEATURE_TYPE && this.props.feature.tag) {
            tagHex = this.props.feature.tag;
            tagUtf8 = Converter.hexToUtf8(this.props.feature.tag);

            try {
                if (tagUtf8) {
                    tagJson = JSON.stringify(JSON.parse(tagUtf8), undefined, "  ");
                }
            } catch { }
        }
        return {
            tagUtf8,
            tagHex,
            tagJson
        };
    }
}

export default FeatureBlock;
