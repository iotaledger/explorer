import { Blake2b } from "@iota/crypto.js-stardust";
import { BASIC_OUTPUT_TYPE, ALIAS_OUTPUT_TYPE, FOUNDRY_OUTPUT_TYPE, NFT_OUTPUT_TYPE,
    TREASURY_OUTPUT_TYPE, SIMPLE_TOKEN_SCHEME_TYPE, ALIAS_ADDRESS_TYPE,
    NFT_ADDRESS_TYPE, IImmutableAliasUnlockCondition, IAliasAddress, INodeInfoBaseToken,
    UnlockConditionTypes, STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE, EXPIRATION_UNLOCK_CONDITION_TYPE,
    TIMELOCK_UNLOCK_CONDITION_TYPE} from "@iota/iota.js-stardust";
import { Converter, HexHelper, WriteStream } from "@iota/util.js-stardust";
import bigInt from "big-integer";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import CopyButton from "../CopyButton";
import DataToggle from "../DataToggle";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import Feature from "./Feature";
import NativeToken from "./NativeToken";
import { OutputProps } from "./OutputProps";
import { OutputState } from "./OutputState";
import UnlockCondition from "./UnlockCondition";
import "./Output.scss";
import { DateHelper } from "../../../helpers/dateHelper";
import Tooltip from "../Tooltip";

/**
 * Component which will display an output.
 */
class Output extends Component<OutputProps, OutputState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * Create a new instance of NewOutput.
     * @param props The props.
     */
    constructor(props: OutputProps) {
        super(props);

        this.state = {
            isExpanded: this.props.isPreExpanded ?? false,
            isFormattedBalance: true,
            isSpecialCondition: false
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        if (this.props.output.type !== TREASURY_OUTPUT_TYPE) {
            const specialUnlockConditionExists = this.props.output.unlockConditions.some(condition =>
                condition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE ||
                condition.type === EXPIRATION_UNLOCK_CONDITION_TYPE ||
                condition.type === TIMELOCK_UNLOCK_CONDITION_TYPE
            );
            this.setState({ isSpecialCondition: specialUnlockConditionExists });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { outputId, output, amount, showCopyAmount, network, isPreExpanded, displayFullOutputId } = this.props;
        const { isExpanded, isFormattedBalance, isSpecialCondition } = this.state;
        const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;

        const aliasOrNftBech32 = this.buildAddressForAliasOrNft();
        const foundryId = this.buildFoundyId();

        const outputIdTransactionPart = displayFullOutputId ?
            `${outputId.slice(0, -4)}` :
            `${outputId.slice(0, 8)}....${outputId.slice(-8, -4)}`;
        const outputIdIndexPart = outputId.slice(-4);

        const specialUnlockCondition = (
            output.type !== TREASURY_OUTPUT_TYPE && isSpecialCondition) && (
                output.unlockConditions.map((unlockCondition, idx) => (
                    <Tooltip key={idx} tooltipContent={this.getSpecialUnlockConditionContent(unlockCondition)}>
                        <span className="material-icons icon">
                            {unlockCondition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE &&
                            "arrow_back"}
                            {unlockCondition.type === EXPIRATION_UNLOCK_CONDITION_TYPE &&
                            "hourglass_bottom"}
                            {unlockCondition.type === TIMELOCK_UNLOCK_CONDITION_TYPE &&
                            "schedule"}
                        </span>
                    </Tooltip>
                ))
        );

        const outputHeader = (
            <div
                onClick={() => this.setState({ isExpanded: !isExpanded })}
                className="card--value card-header--wrapper"
            >
                <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div className="output-header">
                    <button
                        type="button"
                        className="output-type--name margin-r-t color"
                    >
                        {NameHelper.getOutputTypeName(output.type)}
                    </button>
                    <div className="output-id--link">
                        (
                        <Link to={`/${network}/output/${outputId}`} className="margin-r-t">
                            <span>{outputIdTransactionPart}</span>
                            <span className="highlight">{outputIdIndexPart}</span>
                        </Link>
                        )
                        <CopyButton copy={String(outputId)} />
                    </div>
                    {specialUnlockCondition}
                </div>
                {showCopyAmount && (
                    <div className="card--value pointer amount-size row end">
                        <span
                            className="pointer margin-r-t"
                            onClick={e => {
                                this.setState({ isFormattedBalance: !isFormattedBalance });
                                e.stopPropagation();
                            }}
                        >
                            {formatAmount(amount, tokenInfo, !isFormattedBalance)}
                        </span>
                    </div>
                )}
                {showCopyAmount && <CopyButton copy={String(amount)} />}
            </div>
        );

        return (
            <div className="card--content__output">
                {outputHeader}
                {isExpanded && (
                    <div className="output margin-l-t">
                        {output.type === ALIAS_OUTPUT_TYPE && (
                        <React.Fragment>
                            <div className="card--label">
                                Alias address:
                            </div>
                            <div className="card--value row middle">
                                <Link to={`/${network}/search/${aliasOrNftBech32}`} className="margin-r-t">
                                    {aliasOrNftBech32}
                                </Link>
                                <CopyButton copy={aliasOrNftBech32} />
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
                                        <DataToggle
                                            sourceData={output.stateMetadata}
                                            withSpacedHex={true}
                                        />
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
                                Nft address:
                            </div>
                            <div className="card--value row middle">
                                <Link to={`/${network}/search/${aliasOrNftBech32}`} className="margin-r-t">
                                    {aliasOrNftBech32}
                                </Link>
                                <CopyButton copy={aliasOrNftBech32} />
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
                                <CopyButton copy={foundryId} />
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
                                <Feature
                                    key={idx}
                                    feature={feature}
                                    isPreExpanded={isPreExpanded}
                                    isImmutable={false}
                                />
                            ))}
                            {output.type !== BASIC_OUTPUT_TYPE && output.immutableFeatures && (
                                <React.Fragment>
                                    {output.immutableFeatures.map((immutableFeature, idx) => (
                                        <Feature
                                            key={idx}
                                            feature={immutableFeature}
                                            isPreExpanded={isPreExpanded}
                                            isImmutable={true}
                                        />
                                    ))}
                                </React.Fragment>
                            )}
                            {output.nativeTokens?.map((token, idx) => (
                                <NativeToken
                                    key={idx}
                                    tokenId={token.id}
                                    amount={Number(token.amount)}
                                    isPreExpanded={isPreExpanded}
                                />
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
            const aliasId = this.buildHashForAliasOrNft(output.aliasId, outputId);
            address = aliasId;
            addressType = ALIAS_ADDRESS_TYPE;
        } else if (output.type === NFT_OUTPUT_TYPE) {
            const nftId = this.buildHashForAliasOrNft(output.nftId, outputId);
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
     * Compute BLAKE2b-256 hash for alias or nft which has Id 0.
     * @param aliasOrNftId Alias or Nft id.
     * @param outputId Output id.
     * @returns The BLAKE2b-256 hash for Alias or Nft Id.
     */
    private buildHashForAliasOrNft(aliasOrNftId: string, outputId: string): string {
        return !HexHelper.toBigInt256(aliasOrNftId).eq(bigInt.zero) ?
        aliasOrNftId :
        HexHelper.addPrefix(
            Converter.bytesToHex(Blake2b.sum256(Converter.hexToBytes(HexHelper.stripPrefix(outputId))))
        );
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

    /**
     * Get tooltip content for special condition i.e SDRUC, EUC and TUC.
     * @returns The tooltip content.
     */
     private getSpecialUnlockConditionContent(unlockCondition: UnlockConditionTypes): string {
        if (unlockCondition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE) {
            return `Storage Deposit Return Unlock Condition \n Return Amount: ${unlockCondition.amount} glow`;
        } else if (unlockCondition.type === EXPIRATION_UNLOCK_CONDITION_TYPE) {
            const time = DateHelper.format(DateHelper.milliseconds(unlockCondition.unixTime));
            return `Expiration Unlock Condition \n Time: ${time}`;
        } else if (unlockCondition.type === TIMELOCK_UNLOCK_CONDITION_TYPE) {
            const time = DateHelper.format(DateHelper.milliseconds(unlockCondition.unixTime));
            return `Timelock Unlock Condition \n Time: ${time}`;
        }
        return "";
    };
}

export default Output;
