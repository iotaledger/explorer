import { BASIC_OUTPUT_TYPE, ALIAS_OUTPUT_TYPE, FOUNDRY_OUTPUT_TYPE, NFT_OUTPUT_TYPE,
    TREASURY_OUTPUT_TYPE, SIMPLE_TOKEN_SCHEME_TYPE, ALIAS_ADDRESS_TYPE,
    NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { NetworkService } from "../../../services/networkService";
import MessageButton from "../MessageButton";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import FeatureBlock from "./FeatureBlock";
import { OutputProps } from "./OutputProps";
import { OutputState } from "./OutputState";
import UnlockCondition from "./UnlockCondition";

/**
 * Component which will display an output.
 */
class Output extends Component<OutputProps, OutputState> {
    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of NewOutput.
     * @param props The props.
     */
    constructor(props: OutputProps) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = props.network
            ? networkService.get(props.network)
            : undefined;

        this._bechHrp = networkConfig?.bechHrp ?? "iota";

        this.state = {
            output: props.output,
            showOutputDetails: -1,
            bech32: ""
        };
    }

    /**
     * The component mounted.
     */
     public async componentDidMount(): Promise<void> {
        await this.buildAddress();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="output margin-l-t">
                {this.state.output.type === ALIAS_OUTPUT_TYPE && (
                    <React.Fragment>
                        <div className="card--label">
                            Alias id:
                        </div>
                        <div className="card--value row middle">
                            <button
                                type="button"
                                className="margin-r-t"
                            >
                                {this.state.bech32}
                            </button>
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(this.state.bech32)}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </div>
                        <div className="card--label">
                            State index:
                        </div>
                        <div className="card--value row">
                            {this.state.output.stateIndex}
                        </div>
                        <div className="card--label">
                            State metadata:
                        </div>
                        <div className="card--value row">
                            {this.state.output.stateMetadata}
                        </div>
                        <div className="card--label">
                            Foundry counter:
                        </div>
                        <div className="card--value row">
                            {this.state.output.foundryCounter}
                        </div>
                    </React.Fragment>
                )}

                {this.state.output.type === NFT_OUTPUT_TYPE && (
                    <React.Fragment>
                        <div className="card--label">
                            Nft id:
                        </div>
                        <div className="card--value row">
                            <button
                                type="button"
                                className="margin-r-t"
                            >
                                {this.state.bech32}
                            </button>
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(this.state.bech32)}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </div>
                    </React.Fragment>
                )}

                {this.state.output.type === FOUNDRY_OUTPUT_TYPE && (
                    <React.Fragment>
                        <div className="card--label">
                            Serial number:
                        </div>
                        <div className="card--value row">
                            {this.state.output.serialNumber}
                        </div>
                        <div className="card--label">
                            Token tag:
                        </div>
                        <div className="card--value row">
                            {this.state.output.tokenTag}
                        </div>
                        <div className="card--label">
                            Token scheme type:
                        </div>
                        <div className="card--value row">
                            {this.state.output.tokenScheme.type}
                        </div>
                        {this.state.output.tokenScheme.type === SIMPLE_TOKEN_SCHEME_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Minted tokens:
                                </div>
                                <div className="card--value row">
                                    {this.state.output.tokenScheme.mintedTokens}
                                </div>
                                <div className="card--label">
                                    Melted tokens:
                                </div>
                                <div className="card--value row">
                                    {this.state.output.tokenScheme.meltedTokens}
                                </div>
                                <div className="card--label">
                                    Maximum supply:
                                </div>
                                <div className="card--value row">
                                    {this.state.output.tokenScheme.maximumSupply}
                                </div>
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}

                {/* all output types except Treasury have common output conditions */}
                {this.state.output.type !== TREASURY_OUTPUT_TYPE && (
                    <React.Fragment>
                        {this.state.output.unlockConditions.map((unlockCondition, idx) => (
                            <UnlockCondition
                                key={idx}
                                network={this.props.network}
                                unlockCondition={unlockCondition}
                            />
                        ))}
                        {this.state.output.featureBlocks.map((featureBlock, idx) => (
                            <FeatureBlock
                                key={idx}
                                network={this.props.network}
                                featureBlock={featureBlock}
                            />
                        ))}
                        {this.state.output.type !== BASIC_OUTPUT_TYPE && this.state.output.immutableFeatureBlocks && (
                            <React.Fragment>
                                {this.state.output.immutableFeatureBlocks.map((immutableFeatureBlock, idx) => (
                                    <FeatureBlock
                                        key={idx}
                                        network={this.props.network}
                                        featureBlock={immutableFeatureBlock}
                                    />
                                ))}
                            </React.Fragment>
                        )}
                        {this.state.output.nativeTokens.map((token, idx) => (
                            <React.Fragment key={idx}>
                                <div className="native-token">
                                    <div
                                        className="card--content__input card--value row middle"
                                        onClick={() => this.setState({ showOutputDetails:
                                            this.state.showOutputDetails === 1 ? -1 : 1 })}
                                    >
                                        <div className={classNames("margin-r-t", "card--content__input--dropdown",
                                            "card--content__flex_between",
                                            { opened: this.state.showOutputDetails === 1 })}
                                        >
                                            <DropdownIcon />
                                        </div>
                                        <div className="card--label">
                                            Native token
                                        </div>
                                    </div>
                                    {this.state.showOutputDetails === 1 && (
                                    <div className="margin-l-t">
                                        <div className="card--label">
                                            Token id:
                                        </div>
                                        <div className="card--value row">
                                            {token.id}
                                        </div>
                                        <div className="card--label">
                                            Amount:
                                        </div>
                                        <div className="card--value row">
                                            {token.amount}
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                )}

            </div>
        );
    }

    /**
     * Build bech32 address.
     * @returns The bech32 address.
     */
     private async buildAddress() {
        let address: string = "";
        let addressType: number = 0;

        if (this.state.output.type === ALIAS_OUTPUT_TYPE) {
            address = this.state.output.aliasId;
            addressType = ALIAS_ADDRESS_TYPE;
        } else if (this.state.output.type === NFT_OUTPUT_TYPE) {
            address = this.state.output.nftId;
            addressType = NFT_ADDRESS_TYPE;
        }

        this.setState({
            bech32: Bech32AddressHelper.buildAddress(
                this._bechHrp,
                address,
                addressType
            ).bech32
        });
    }
}

export default Output;
