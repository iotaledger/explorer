import { ISSUER_FEATURE_BLOCK_TYPE, METADATA_FEATURE_BLOCK_TYPE, SENDER_FEATURE_BLOCK_TYPE, TAG_FEATURE_BLOCK_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import Bech32HrpContext from "../../../helpers/stardust/bech32HrpContext";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { INetwork } from "../../../models/db/INetwork";
import { NetworkService } from "../../../services/networkService";
import AsyncComponent from "../AsyncComponent";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import Address from "./Address";
import { FeatureBlockProps } from "./FeatureBlockProps";
import { FeatureBlockState } from "./FeatureBlockState";
/**
 * Component which will display an Feature Block.
 */
class FeatureBlock extends AsyncComponent<FeatureBlockProps, FeatureBlockState> {
    private readonly networkConfig: INetwork | undefined;

    constructor(props: FeatureBlockProps) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        this.networkConfig = props.network
            ? networkService.get(props.network)
            : undefined;

        this.state = {
            showOutputDetails: -1
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
                    onClick={() => this.setState({ showOutputDetails: this.state.showOutputDetails === 1 ? -1 : 1 })}
                >
                    <div className={classNames("margin-r-t", "card--content__input--dropdown",
                        "card--content__flex_between", { opened: this.state.showOutputDetails === 1 })}
                    >
                        <DropdownIcon />
                    </div>
                    <div className="card--label">
                        {NameHelper.getFeatureBlockTypeName(this.props.featureBlock.type)}
                    </div>
                </div>
                {this.state.showOutputDetails === 1 && (
                    <div className="margin-l-t">
                        {this.props.featureBlock.type === SENDER_FEATURE_BLOCK_TYPE && (
                            <Bech32HrpContext.Provider
                                value={{
                                    bech32Hrp: this.networkConfig?.bechHrp ?? "iota"
                                }}
                            >
                                <Address
                                    address={this.props.featureBlock.address}
                                />
                            </Bech32HrpContext.Provider>
                        )}
                        {this.props.featureBlock.type === ISSUER_FEATURE_BLOCK_TYPE && (
                            <Bech32HrpContext.Provider
                                value={{
                                    bech32Hrp: this.networkConfig?.bechHrp ?? "iota"
                                }}
                            >
                                <Address
                                    address={this.props.featureBlock.address}
                                />
                            </Bech32HrpContext.Provider>
                        )}
                        {this.props.featureBlock.type === METADATA_FEATURE_BLOCK_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Data:
                                </div>
                                <div className="card--value row">
                                    {this.props.featureBlock.data}
                                </div>
                            </React.Fragment>
                        )}
                        {this.props.featureBlock.type === TAG_FEATURE_BLOCK_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Tag:
                                </div>
                                <div className="card--value row">
                                    {this.props.featureBlock.tag}
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
