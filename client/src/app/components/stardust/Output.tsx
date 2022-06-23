import { Blake2b } from "@iota/crypto.js-stardust";
import { BASIC_OUTPUT_TYPE, ALIAS_OUTPUT_TYPE, FOUNDRY_OUTPUT_TYPE, NFT_OUTPUT_TYPE,
    TREASURY_OUTPUT_TYPE, SIMPLE_TOKEN_SCHEME_TYPE, ALIAS_ADDRESS_TYPE,
    NFT_ADDRESS_TYPE,
    IImmutableAliasUnlockCondition,
    IAliasAddress } from "@iota/iota.js-stardust";
import { Converter, HexHelper, WriteStream } from "@iota/util.js-stardust";
import bigInt from "big-integer";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import CopyButton from "../CopyButton";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import Feature from "./Feature";
import { OutputProps } from "./OutputProps";
import { OutputState } from "./OutputState";
import UnlockCondition from "./UnlockCondition";

/**
 * Component which will display an output.
 */
class Output extends Component<OutputProps, OutputState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * Create a new instance of NewOutput.
     * @param props The props.
     */
    constructor(props: OutputProps) {
        super(props);

        this.state = {
            output: props.output,
            showNativeToken: false,
            isExpanded: false,
            isFormattedBalance: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const aliasOrNftBech32 = this.buildAddressForAliasOrNft();
        const foundryId = this.buildFoundyId();

        return (
            <div>
                <div
                    className="card--content__input card--value"
                    onClick={() => this.setState({ isExpanded: !this.state.isExpanded })}
                >
                    <div className={classNames("margin-r-t", "card--content__input--dropdown",
                        "card--content__flex_between",
                        { opened: this.state.isExpanded })}
                    >
                        <DropdownIcon />
                    </div>
                    <button
                        type="button"
                        className="margin-r-t color"
                    >
                        {NameHelper.getOutputTypeName(this.props.output.type)}
                    </button>
                    {
                        this.props.showCopyAmount &&
                        <div className="card--value pointer amount-size row end">
                            <span
                                className="margin-r-t"
                                onClick={e => {
                                    this.setState({ isFormattedBalance: !this.state.isFormattedBalance });
                                    e.stopPropagation();
                                }}
                            >
                                {
                                    this.state.isFormattedBalance
                                    ? formatAmount(this.props.amount, this.context.tokenInfo)
                                    : this.props.amount
                                }
                            </span>
                        </div>
                    }
                    {
                        this.props.showCopyAmount &&
                        <CopyButton
                            onClick={e => {
                                ClipboardHelper.copy(String(this.props.amount));
                                if (e) {
                                    e.stopPropagation();
                                }
                            }}
                            buttonType="copy"
                            labelPosition="bottom"
                        />
                    }
                </div>
                {this.state.isExpanded && (
                    <div className="output margin-l-t">
                        {this.state.output.type === ALIAS_OUTPUT_TYPE && (
                        <React.Fragment>
                            <div className="card--label">
                                Alias id:
                            </div>
                            <div className="card--value row middle">
                                <Link
                                    to={`/${this.props.network}/search/${aliasOrNftBech32}`}
                                    className="margin-r-t"
                                >
                                    {aliasOrNftBech32}
                                </Link>
                                <CopyButton
                                    onClick={() => ClipboardHelper.copy(aliasOrNftBech32)}
                                    buttonType="copy"
                                    labelPosition="bottom"
                                />
                            </div>
                            <div className="card--label">
                                State index:
                            </div>
                            <div className="card--value row">
                                {this.state.output.stateIndex}
                            </div>
                            {this.state.output.stateMetadata && (
                                <React.Fragment>
                                    <div className="card--label">
                                        State metadata:
                                    </div>
                                    <div className="card--value row">
                                        {this.state.output.stateMetadata}
                                    </div>
                                </React.Fragment>
                            )}
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
                            <div className="card--value row middle">
                                <Link
                                    to={`/${this.props.network}/search/${aliasOrNftBech32}`}
                                    className="margin-r-t"
                                >
                                    {aliasOrNftBech32}
                                </Link>
                                <CopyButton
                                    onClick={() => ClipboardHelper.copy(aliasOrNftBech32)}
                                    buttonType="copy"
                                />
                            </div>
                        </React.Fragment>
                        )}

                        {this.state.output.type === FOUNDRY_OUTPUT_TYPE && (
                        <React.Fragment>
                            <div className="card--label">
                                Foundry id:
                            </div>
                            <div className="card--value row middle">
                                <Link
                                    to={`/${this.props.network}/search/${foundryId}`}
                                    className="margin-r-t"
                                >
                                    {foundryId}
                                </Link>
                                <CopyButton
                                    onClick={() => ClipboardHelper.copy(foundryId)}
                                    buttonType="copy"
                                />
                            </div>
                            <div className="card--label">
                                Serial number:
                            </div>
                            <div className="card--value row">
                                {this.state.output.serialNumber}
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
                                        {Number(this.state.output.tokenScheme.mintedTokens)}
                                    </div>
                                    <div className="card--label">
                                        Melted tokens:
                                    </div>
                                    <div className="card--value row">
                                        {Number(this.state.output.tokenScheme.meltedTokens)}
                                    </div>
                                    <div className="card--label">
                                        Maximum supply:
                                    </div>
                                    <div className="card--value row">
                                        {Number(this.state.output.tokenScheme.maximumSupply)}
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
                                    unlockCondition={unlockCondition}
                                />
                            ))}
                            {this.state.output.features?.map((feature, idx) => (
                                <Feature
                                    key={idx}
                                    feature={feature}
                                />
                            ))}
                            {this.state.output.type !== BASIC_OUTPUT_TYPE && this.state.output.immutableFeatures && (
                                <React.Fragment>
                                    {this.state.output.immutableFeatures.map((immutableFeature, idx) => (
                                        <Feature
                                            key={idx}
                                            feature={immutableFeature}
                                        />
                                    ))}
                                </React.Fragment>
                            )}
                            {this.state.output.nativeTokens?.map((token, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="native-token">
                                        <div
                                            className="card--content__input card--value row middle"
                                            onClick={() => this.setState({ showNativeToken: !this.state.showNativeToken })}
                                        >
                                            <div className={classNames("margin-r-t", "card--content__input--dropdown",
                                                "card--content__flex_between",
                                                { opened: this.state.showNativeToken })}
                                            >
                                                <DropdownIcon />
                                            </div>
                                            <div className="card--label">
                                                Native token
                                            </div>
                                        </div>
                                        {this.state.showNativeToken && (
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
                                                {Number(token.amount)}
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                        )}
                    </div>
                )}
            </div>
        );
    }

    /**
     * Build bech32 address.
     * @returns The bech32 address.
     */
     private buildAddressForAliasOrNft() {
        let address: string = "";
        let addressType: number = 0;

        if (this.state.output.type === ALIAS_OUTPUT_TYPE) {
            address = this.state.output.aliasId;
            addressType = ALIAS_ADDRESS_TYPE;
        } else if (this.state.output.type === NFT_OUTPUT_TYPE) {
            const nftId = !HexHelper.toBigInt256(this.state.output.nftId).eq(bigInt.zero)
                ? this.state.output.nftId
                    // NFT has Id 0 because it hasn't move, but we can compute it as a hash of the outputId
                    : HexHelper.addPrefix(Converter.bytesToHex(
                        Blake2b.sum256(Converter.hexToBytes(HexHelper.stripPrefix(this.props.id)))
                    ));
            address = nftId;
            addressType = NFT_ADDRESS_TYPE;
        }

        return Bech32AddressHelper.buildAddress(
                this.context.bech32Hrp,
                address,
                addressType
            ).bech32;
    }

    /**
     * Build a FoundryId from aliasAddres, serialNumber and tokenSchemeType
     * @returns The FoundryId string.
     */
     private buildFoundyId() {
        if (this.state.output.type === FOUNDRY_OUTPUT_TYPE) {
            const immutableAliasUnlockCondition =
            this.state.output.unlockConditions[0] as IImmutableAliasUnlockCondition;
            const aliasId = (immutableAliasUnlockCondition.address as IAliasAddress).aliasId;
            const typeWS = new WriteStream();
            typeWS.writeUInt8("alias address type", ALIAS_ADDRESS_TYPE);
            const aliasAddress = HexHelper.addPrefix(
                `${typeWS.finalHex()}${HexHelper.stripPrefix(aliasId)}`
            );
            const serialNumberWS = new WriteStream();
            serialNumberWS.writeUInt32("serialNumber", this.state.output.serialNumber);
            const serialNumberHex = serialNumberWS.finalHex();
            const tokenSchemeTypeWS = new WriteStream();
            tokenSchemeTypeWS.writeUInt8("tokenSchemeType", this.state.output.tokenScheme.type);
            const tokenSchemeTypeHex = tokenSchemeTypeWS.finalHex();

            return `${aliasAddress}${serialNumberHex}${tokenSchemeTypeHex}`;
        }
    }
}

export default Output;
