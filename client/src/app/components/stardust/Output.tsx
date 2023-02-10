import {
    BASIC_OUTPUT_TYPE, ALIAS_OUTPUT_TYPE, FOUNDRY_OUTPUT_TYPE, NFT_OUTPUT_TYPE,
    TREASURY_OUTPUT_TYPE, SIMPLE_TOKEN_SCHEME_TYPE, ALIAS_ADDRESS_TYPE,
    NFT_ADDRESS_TYPE, IImmutableAliasUnlockCondition, IAliasAddress, INodeInfoBaseToken,
    UnlockConditionTypes, STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE, EXPIRATION_UNLOCK_CONDITION_TYPE,
    TIMELOCK_UNLOCK_CONDITION_TYPE,
    TransactionHelper
} from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "../../../helpers/dateHelper";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import CopyButton from "../CopyButton";
import DataToggle from "../DataToggle";
import Tooltip from "../Tooltip";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import Feature from "./Feature";
import NativeToken from "./NativeToken";
import { OutputProps } from "./OutputProps";
import { OutputState } from "./OutputState";
import TruncatedId from "./TruncatedId";
import UnlockCondition from "./UnlockCondition";
import "./Output.scss";

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
            isFormattedBalance: true
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            outputId, output, amount, showCopyAmount, network, isPreExpanded, displayFullOutputId, isLinksDisabled
        } = this.props;
        const { isExpanded, isFormattedBalance } = this.state;
        const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;

        const aliasOrNftBech32 = this.buildAddressForAliasOrNft();
        const foundryId = this.buildFoundryId();

        const outputIdTransactionPart = displayFullOutputId ?
            `${outputId.slice(0, -4)}` :
            `${outputId.slice(0, 8)}....${outputId.slice(-8, -4)}`;
        const outputIdIndexPart = outputId.slice(-4);
        const isSpecialCondition = this.hasSpecialCondition();

        const specialUnlockCondition = (
            output.type !== TREASURY_OUTPUT_TYPE && isSpecialCondition) && (
                output.unlockConditions.map((unlockCondition, idx) => (
                    <Tooltip key={idx} tooltipContent={this.getSpecialUnlockConditionContent(unlockCondition)}>
                        <span className="material-icons unlock-condition-icon">
                            {unlockCondition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE && "arrow_back"}
                            {unlockCondition.type === EXPIRATION_UNLOCK_CONDITION_TYPE && "hourglass_bottom"}
                            {unlockCondition.type === TIMELOCK_UNLOCK_CONDITION_TYPE && "schedule"}
                        </span>
                    </Tooltip>
                ))
            );

        const outputHeader = (
            <div
                onClick={() => this.setState({ isExpanded: !isExpanded })}
                className="card--value card-header--wrapper"
            >
                <div className={classNames("card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div className="output-header">
                    <button
                        type="button"
                        className="output-type--name color"
                    >
                        {NameHelper.getOutputTypeName(output.type)}
                    </button>
                    <div className="output-id--link">
                        (
                        {isLinksDisabled ?
                            <div className="margin-r-t">
                                <span className="highlight">{outputIdTransactionPart}</span>
                                <span className="highlight">{outputIdIndexPart}</span>
                            </div> :
                            <Link to={`/${network}/output/${outputId}`} className="margin-r-t">
                                <span>{outputIdTransactionPart}</span>
                                <span className="highlight">{outputIdIndexPart}</span>
                            </Link>}
                        )
                        <CopyButton copy={String(outputId)} />
                    </div>
                    {specialUnlockCondition}
                </div>
                {showCopyAmount && (
                    <div className="card--value pointer amount-size row end">
                        <span
                            className="pointer"
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
                    <div className="output padding-l-t left-border">
                        {output.type === ALIAS_OUTPUT_TYPE && (
                            <React.Fragment>
                                <div className="card--label">Alias address:</div>
                                <div className="card--value">
                                    <TruncatedId
                                        id={aliasOrNftBech32}
                                        link={isLinksDisabled ? undefined : `/${network}/addr/${aliasOrNftBech32}`}
                                        showCopyButton
                                    />
                                </div>
                                <div className="card--label">State index:</div>
                                <div className="card--value row">{output.stateIndex}</div>
                                {output.stateMetadata && (
                                    <React.Fragment>
                                        <div className="card--label">State metadata:</div>
                                        <div className="card--value row">
                                            <DataToggle
                                                sourceData={output.stateMetadata}
                                                withSpacedHex={true}
                                            />
                                        </div>
                                    </React.Fragment>
                                )}
                                <div className="card--label">Foundry counter:</div>
                                <div className="card--value row">{output.foundryCounter}</div>
                            </React.Fragment>
                        )}

                        {output.type === NFT_OUTPUT_TYPE && (
                            <React.Fragment>
                                <div className="card--label">Nft address:</div>
                                <div className="card--value">
                                    <TruncatedId
                                        id={aliasOrNftBech32}
                                        link={isLinksDisabled ? undefined : `/${network}/addr/${aliasOrNftBech32}`}
                                        showCopyButton
                                    />
                                </div>
                            </React.Fragment>
                        )}

                        {output.type === FOUNDRY_OUTPUT_TYPE && (
                            <React.Fragment>
                                <div className="card--label">Foundry id:</div>
                                <div className="card--value">
                                    {isLinksDisabled ?
                                        <TruncatedId
                                            id={foundryId ?? ""}
                                            showCopyButton
                                        /> :
                                        <TruncatedId
                                            id={foundryId ?? ""}
                                            link={`/${network}/foundry/${foundryId}`}
                                            showCopyButton
                                        />}
                                </div>
                                <div className="card--label">Serial number:</div>
                                <div className="card--value row">{output.serialNumber}</div>
                                <div className="card--label">Token scheme type:</div>
                                <div className="card--value row">{output.tokenScheme.type}</div>
                                {output.tokenScheme.type === SIMPLE_TOKEN_SCHEME_TYPE && (
                                    <React.Fragment>
                                        <div className="card--label">Minted tokens:</div>
                                        <div className="card--value row">
                                            {Number(output.tokenScheme.mintedTokens)}
                                        </div>
                                        <div className="card--label">Melted tokens:</div>
                                        <div className="card--value row">
                                            {Number(output.tokenScheme.meltedTokens)}
                                        </div>
                                        <div className="card--label">Maximum supply:</div>
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
            const aliasId = TransactionsHelper.buildIdHashForAliasOrNft(output.aliasId, outputId);
            address = aliasId;
            addressType = ALIAS_ADDRESS_TYPE;
        } else if (output.type === NFT_OUTPUT_TYPE) {
            const nftId = TransactionsHelper.buildIdHashForAliasOrNft(output.nftId, outputId);
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
    private buildFoundryId(): string | undefined {
        const output = this.props.output;
        if (output.type === FOUNDRY_OUTPUT_TYPE) {
            const immutableAliasUnlockCondition = output.unlockConditions[0] as IImmutableAliasUnlockCondition;
            const aliasId = (immutableAliasUnlockCondition.address as IAliasAddress).aliasId;
            return TransactionHelper.constructTokenId(
                aliasId,
                output.serialNumber,
                output.tokenScheme.type
            );
        }
    }

    /**
     * Get tooltip content for special condition i.e SDRUC, EUC and TUC.
     * @param unlockCondition Unlock condition of output.
     * @returns The tooltip content.
     */
    private getSpecialUnlockConditionContent(unlockCondition: UnlockConditionTypes): React.ReactNode {
        if (unlockCondition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE) {
            return (
                <React.Fragment>
                    <span>Storage Deposit Return Unlock Condition</span> <br />
                    <span>Return Amount: {unlockCondition.amount} glow</span>
                </React.Fragment>
            );
        } else if (unlockCondition.type === EXPIRATION_UNLOCK_CONDITION_TYPE) {
            const time = DateHelper.format(DateHelper.milliseconds(unlockCondition.unixTime));
            return (
                <React.Fragment>
                    <span>Expiration Unlock Condition</span> <br />
                    <span>Time: {time} </span>
                </React.Fragment>
            );
        } else if (unlockCondition.type === TIMELOCK_UNLOCK_CONDITION_TYPE) {
            const time = DateHelper.format(DateHelper.milliseconds(unlockCondition.unixTime));
            return (
                <React.Fragment>
                    <span>Timelock Unlock Condition</span> <br />
                    <span>Time: {time} </span>
                </React.Fragment>
            );
        }
    }

    /**
     * Check if output has special condition i.e SDRUC, EUC and TUC.
     * @returns special condition exists.
     */
    private hasSpecialCondition(): boolean {
        let specialUnlockConditionExists = false;
        if (this.props.output.type !== TREASURY_OUTPUT_TYPE) {
            specialUnlockConditionExists = this.props.output.unlockConditions.some(condition =>
                condition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE ||
                condition.type === EXPIRATION_UNLOCK_CONDITION_TYPE ||
                condition.type === TIMELOCK_UNLOCK_CONDITION_TYPE
            );
        }
        return specialUnlockConditionExists;
    }
}

export default Output;
