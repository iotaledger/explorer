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
            showNativeToken: false,
            isExpanded: this.props.isPreExpanded ?? false,
            isFormattedBalance: true
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { output, amount, showCopyAmount, network, isPreExpanded } = this.props;
        const { showNativeToken, isExpanded, isFormattedBalance } = this.state;

        const aliasOrNftBech32 = this.buildAddressForAliasOrNft();
        const foundryId = this.buildFoundyId();

        const outputHeader = (
            <div
                className="card--content__input card--value"
                onClick={() => this.setState({ isExpanded: !isExpanded })}
            >
                <div className={classNames("margin-r-t", "card--content__input--dropdown",
                                           "card--content__flex_between",
                                           { opened: isExpanded })}
                >
                    <DropdownIcon />
                </div>
                <button
                    type="button"
                    className="margin-r-t color"
                >
                    {NameHelper.getOutputTypeName(output.type)}
                </button>
                {showCopyAmount && (
                    <div className="card--value pointer amount-size row end">
                        <span
                            className="margin-r-t"
                            onClick={e => {
                                this.setState({ isFormattedBalance: !isFormattedBalance });
                                e.stopPropagation();
                            }}
                        >
                            {
                                isFormattedBalance
                                    ? formatAmount(amount, this.context.tokenInfo)
                                    : amount
                            }
                        </span>
                    </div>
                )}
                {showCopyAmount &&
                    <CopyButton
                        onClick={e => {
                            ClipboardHelper.copy(String(amount));
                            if (e) {
                                e.stopPropagation();
                            }
                        }}
                        buttonType="copy"
                        labelPosition="bottom"
                    />}
            </div>
        );

        return (
            <div className="card--content">
                {outputHeader}
                {isExpanded && (
                    <div className="output margin-l-t">
                        {output.type === ALIAS_OUTPUT_TYPE && (
                        <React.Fragment>
                            <div className="card--label">
                                Alias id:
                            </div>
                            <div className="card--value row middle">
                                <Link to={`/${network}/search/${aliasOrNftBech32}`} className="margin-r-t">
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
                                {output.stateIndex}
                            </div>
                            {output.stateMetadata && (
                                <React.Fragment>
                                    <div className="card--label">
                                        State metadata:
                                    </div>
                                    <div className="card--value row">
                                        {output.stateMetadata}
                                    </div>
                                </React.Fragment>
                            )}
                            <div className="card--label">
                                Foundry counter:
                            </div>
                            <div className="card--value row">
                                {output.foundryCounter}
                            </div>
                        </React.Fragment>
                        )}

                        {output.type === NFT_OUTPUT_TYPE && (
                        <React.Fragment>
                            <div className="card--label">
                                Nft id:
                            </div>
                            <div className="card--value row middle">
                                <Link to={`/${network}/search/${aliasOrNftBech32}`} className="margin-r-t">
                                    {aliasOrNftBech32}
                                </Link>
                                <CopyButton
                                    onClick={() => ClipboardHelper.copy(aliasOrNftBech32)}
                                    buttonType="copy"
                                />
                            </div>
                        </React.Fragment>
                        )}

                        {output.type === FOUNDRY_OUTPUT_TYPE && (
                        <React.Fragment>
                            <div className="card--label">
                                Foundry id:
                            </div>
                            <div className="card--value row middle">
                                <Link
                                    to={`/${network}/search/${foundryId}`}
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
                                {output.serialNumber}
                            </div>
                            <div className="card--label">
                                Token scheme type:
                            </div>
                            <div className="card--value row">
                                {output.tokenScheme.type}
                            </div>
                            {output.tokenScheme.type === SIMPLE_TOKEN_SCHEME_TYPE && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Minted tokens:
                                    </div>
                                    <div className="card--value row">
                                        {Number(output.tokenScheme.mintedTokens)}
                                    </div>
                                    <div className="card--label">
                                        Melted tokens:
                                    </div>
                                    <div className="card--value row">
                                        {Number(output.tokenScheme.meltedTokens)}
                                    </div>
                                    <div className="card--label">
                                        Maximum supply:
                                    </div>
                                    <div className="card--value row">
                                        {Number(output.tokenScheme.maximumSupply)}
                                    </div>
                                </React.Fragment>
                            )}
                        </React.Fragment>
                        )}

                        {/* all output types except Treasury have common output conditions */}
                        {output.type !== TREASURY_OUTPUT_TYPE && (
                        <React.Fragment>
                            {output.unlockConditions.map((unlockCondition, idx) => (
                                <UnlockCondition
                                    key={idx}
                                    unlockCondition={unlockCondition}
                                    isPreExpanded={isPreExpanded}
                                />
                            ))}
                            {output.features?.map((feature, idx) => (
                                <Feature key={idx} feature={feature} isPreExpanded={isPreExpanded} />
                            ))}
                            {output.type !== BASIC_OUTPUT_TYPE && output.immutableFeatures && (
                                <React.Fragment>
                                    {output.immutableFeatures.map((immutableFeature, idx) => (
                                        <Feature key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} />
                                    ))}
                                </React.Fragment>
                            )}
                            {output.nativeTokens?.map((token, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="native-token">
                                        <div
                                            className="card--content__input card--value row middle"
                                            onClick={() => this.setState({ showNativeToken: !showNativeToken })}
                                        >
                                            <div className={classNames("margin-r-t", "card--content__input--dropdown",
                                                "card--content__flex_between",
                                                { opened: showNativeToken })}
                                            >
                                                <DropdownIcon />
                                            </div>
                                            <div className="card--label">
                                                Native token
                                            </div>
                                        </div>
                                        {showNativeToken && (
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
         const { outputId, output } = this.props;
         let address: string = "";
         let addressType: number = 0;

         if (output.type === ALIAS_OUTPUT_TYPE) {
             address = output.aliasId;
             addressType = ALIAS_ADDRESS_TYPE;
         } else if (output.type === NFT_OUTPUT_TYPE) {
             const nftId = !HexHelper.toBigInt256(output.nftId).eq(bigInt.zero) ?
                 output.nftId :
                 // NFT has Id 0 because it hasn't move, but we can compute it as a hash of the outputId
                 HexHelper.addPrefix(
                     Converter.bytesToHex(Blake2b.sum256(Converter.hexToBytes(HexHelper.stripPrefix(outputId))))
                 );
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
         const { output } = this.props;

         if (output.type === FOUNDRY_OUTPUT_TYPE) {
             const immutableAliasUnlockCondition =
                 output.unlockConditions[0] as IImmutableAliasUnlockCondition;
             const aliasId = (immutableAliasUnlockCondition.address as IAliasAddress).aliasId;
             const typeWS = new WriteStream();
             typeWS.writeUInt8("alias address type", ALIAS_ADDRESS_TYPE);
             const aliasAddress = HexHelper.addPrefix(
                 `${typeWS.finalHex()}${HexHelper.stripPrefix(aliasId)}`
             );
             const serialNumberWS = new WriteStream();
             serialNumberWS.writeUInt32("serialNumber", output.serialNumber);
             const serialNumberHex = serialNumberWS.finalHex();
             const tokenSchemeTypeWS = new WriteStream();
             tokenSchemeTypeWS.writeUInt8("tokenSchemeType", output.tokenScheme.type);
             const tokenSchemeTypeHex = tokenSchemeTypeWS.finalHex();

             return `${aliasAddress}${serialNumberHex}${tokenSchemeTypeHex}`;
         }
    }
}

export default Output;
