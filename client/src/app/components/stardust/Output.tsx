/* eslint-disable react/static-property-placement */
import {
    AddressType,
    AliasAddress,
    AliasOutput,
    CommonOutput,
    ExpirationUnlockCondition,
    FoundryOutput,
    ImmutableAliasAddressUnlockCondition,
    INodeInfoBaseToken,
    NftOutput,
    OutputType,
    SimpleTokenScheme,
    StorageDepositReturnUnlockCondition,
    TimelockUnlockCondition,
    TokenSchemeType,
    UnlockCondition as IUnlockCondition,
    UnlockConditionType,
    Utils,
} from "@iota/sdk-wasm-stardust/web";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import Feature from "./Feature";
import NativeToken from "./NativeToken";
import { OutputProps } from "./OutputProps";
import { OutputState } from "./OutputState";
import TruncatedId from "./TruncatedId";
import UnlockCondition from "./UnlockCondition";
import { DateHelper } from "~helpers/dateHelper";
import { Bech32AddressHelper } from "~helpers/stardust/bech32AddressHelper";
import { NameHelper } from "~helpers/stardust/nameHelper";
import { TransactionsHelper } from "~helpers/stardust/transactionsHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import CopyButton from "../CopyButton";
import DataToggle from "../DataToggle";
import Tooltip from "../Tooltip";
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
            isExpanded: this.props.preExpandedConfig?.isAllPreExpanded ?? this.props.preExpandedConfig?.isPreExpanded ?? false,
            isFormattedBalance: true,
        };
    }

    componentDidUpdate(prevProps: Readonly<OutputProps>): void {
        if (prevProps.preExpandedConfig !== this.props.preExpandedConfig) {
            this.setState({
                isExpanded: this.props.preExpandedConfig?.isAllPreExpanded ?? this.props.preExpandedConfig?.isPreExpanded ?? false,
            });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { outputId, output, amount, showCopyAmount, network, preExpandedConfig, displayFullOutputId, isLinksDisabled } = this.props;
        const { isExpanded, isFormattedBalance } = this.state;
        const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;

        const aliasOrNftBech32 = this.buildAddressForAliasOrNft();
        const foundryId = this.buildFoundryId();

        const outputIdTransactionPart = displayFullOutputId
            ? `${outputId.slice(0, -4)}`
            : `${outputId.slice(0, 8)}....${outputId.slice(-8, -4)}`;
        const outputIdIndexPart = outputId.slice(-4);
        const isSpecialCondition = this.hasSpecialCondition();
        const isParticipationOutput = TransactionsHelper.isParticipationEventOutput(output);

        const specialUnlockCondition =
            output.type !== OutputType.Treasury &&
            isSpecialCondition &&
            (output as CommonOutput).unlockConditions.map((unlockCondition, idx) => (
                <Tooltip key={idx} tooltipContent={this.getSpecialUnlockConditionContent(unlockCondition)}>
                    <span className="material-icons unlock-condition-icon">
                        {unlockCondition.type === UnlockConditionType.StorageDepositReturn && "arrow_back"}
                        {unlockCondition.type === UnlockConditionType.Expiration && "hourglass_bottom"}
                        {unlockCondition.type === UnlockConditionType.Timelock && "schedule"}
                    </span>
                </Tooltip>
            ));

        const outputHeader = (
            <div onClick={() => this.setState({ isExpanded: !isExpanded })} className="card--value card-header--wrapper">
                <div className={classNames("card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div className="output-header">
                    <button type="button" className="output-type--name color">
                        {NameHelper.getOutputTypeName(output.type)}
                    </button>
                    <div className="output-id--link">
                        (
                        {isLinksDisabled ? (
                            <div className="margin-r-t">
                                <span className="highlight">{outputIdTransactionPart}</span>
                                <span className="highlight">{outputIdIndexPart}</span>
                            </div>
                        ) : (
                            <Link to={`/${network}/output/${outputId}`} className="margin-r-t">
                                <span>{outputIdTransactionPart}</span>
                                <span className="highlight">{outputIdIndexPart}</span>
                            </Link>
                        )}
                        )
                        <CopyButton copy={String(outputId)} />
                    </div>
                    {specialUnlockCondition}
                </div>
                {showCopyAmount && (
                    <div className="card--value pointer amount-size row end">
                        <span
                            className="pointer"
                            onClick={(e) => {
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
                        {output.type === OutputType.Alias && (
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
                                <div className="card--value row">{(output as AliasOutput).stateIndex}</div>
                                {(output as AliasOutput).stateMetadata !== undefined && (
                                    <React.Fragment>
                                        <div className="card--label">State metadata:</div>
                                        <div className="card--value row">
                                            <DataToggle sourceData={(output as AliasOutput).stateMetadata ?? ""} withSpacedHex={true} />
                                        </div>
                                    </React.Fragment>
                                )}
                                <div className="card--label">Foundry counter:</div>
                                <div className="card--value row">{(output as AliasOutput).foundryCounter}</div>
                            </React.Fragment>
                        )}

                        {output.type === OutputType.Nft && (
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

                        {output.type === OutputType.Foundry && (
                            <React.Fragment>
                                <div className="card--label">Foundry id:</div>
                                <div className="card--value">
                                    {foundryId && (
                                        <TruncatedId
                                            id={foundryId}
                                            link={isLinksDisabled ? undefined : `/${network}/foundry/${foundryId}`}
                                            showCopyButton
                                        />
                                    )}
                                </div>
                                <div className="card--label">Serial number:</div>
                                <div className="card--value row">{(output as FoundryOutput).serialNumber}</div>
                                <div className="card--label">Token scheme type:</div>
                                <div className="card--value row">{(output as FoundryOutput).tokenScheme.type}</div>
                                {(output as FoundryOutput).tokenScheme.type === TokenSchemeType.Simple && (
                                    <React.Fragment>
                                        <div className="card--label">Minted tokens:</div>
                                        <div className="card--value row">
                                            {Number(((output as FoundryOutput).tokenScheme as SimpleTokenScheme).mintedTokens)}
                                        </div>
                                        <div className="card--label">Melted tokens:</div>
                                        <div className="card--value row">
                                            {Number(((output as FoundryOutput).tokenScheme as SimpleTokenScheme).meltedTokens)}
                                        </div>
                                        <div className="card--label">Maximum supply:</div>
                                        <div className="card--value row">
                                            {Number(((output as FoundryOutput).tokenScheme as SimpleTokenScheme).maximumSupply)}
                                        </div>
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}

                        {/* all output types except Treasury have common output conditions */}
                        {output.type !== OutputType.Treasury && (
                            <React.Fragment>
                                {(output as CommonOutput).unlockConditions.map((unlockCondition, idx) => {
                                    const isPreExpanded =
                                        preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.unlockConditions?.[idx] ?? false;
                                    return <UnlockCondition key={idx} unlockCondition={unlockCondition} isPreExpanded={isPreExpanded} />;
                                })}
                                {(output as CommonOutput).features?.map((feature, idx) => {
                                    const isPreExpanded =
                                        preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.features?.[idx] ?? false;
                                    return (
                                        <Feature
                                            key={idx}
                                            feature={feature}
                                            isImmutable={false}
                                            isParticipationEventMetadata={isParticipationOutput}
                                            isPreExpanded={isPreExpanded}
                                        />
                                    );
                                })}
                                {output.type === OutputType.Alias &&
                                    (output as AliasOutput).immutableFeatures?.map((immutableFeature, idx) => {
                                        const isPreExpanded =
                                            preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.immutableFeatures?.[idx] ?? false;
                                        return (
                                            <Feature
                                                key={idx}
                                                feature={immutableFeature}
                                                isImmutable={true}
                                                isPreExpanded={isPreExpanded}
                                            />
                                        );
                                    })}
                                {output.type === OutputType.Nft &&
                                    (output as NftOutput).immutableFeatures?.map((immutableFeature, idx) => {
                                        const isPreExpanded =
                                            preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.immutableFeatures?.[idx] ?? false;
                                        return (
                                            <Feature
                                                key={idx}
                                                feature={immutableFeature}
                                                isImmutable={true}
                                                isPreExpanded={isPreExpanded}
                                            />
                                        );
                                    })}
                                {output.type === OutputType.Foundry &&
                                    (output as FoundryOutput).immutableFeatures?.map((immutableFeature, idx) => {
                                        const isPreExpanded =
                                            preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.immutableFeatures?.[idx] ?? false;
                                        return (
                                            <Feature
                                                key={idx}
                                                feature={immutableFeature}
                                                isImmutable={true}
                                                isPreExpanded={isPreExpanded}
                                            />
                                        );
                                    })}
                                {(output as CommonOutput).nativeTokens?.map((token, idx) => {
                                    const isPreExpanded =
                                        preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.nativeTokens?.[idx] ?? false;
                                    return (
                                        <NativeToken
                                            key={idx}
                                            tokenId={token.id}
                                            amount={Number(token.amount)}
                                            isPreExpanded={isPreExpanded}
                                        />
                                    );
                                })}
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

        if (output.type === OutputType.Alias) {
            const aliasId = TransactionsHelper.buildIdHashForNft((output as AliasOutput).aliasId, outputId);
            address = aliasId;
            addressType = AddressType.Alias;
        } else if (output.type === OutputType.Nft) {
            const nftId = TransactionsHelper.buildIdHashForAlias((output as NftOutput).nftId, outputId);
            address = nftId;
            addressType = AddressType.Nft;
        }

        return Bech32AddressHelper.buildAddress(this.context.bech32Hrp, address, addressType).bech32;
    }

    /**
     * Build a FoundryId from aliasAddres, serialNumber and tokenSchemeType
     * @returns The FoundryId string.
     */
    private buildFoundryId(): string | undefined {
        const output = this.props.output;
        if (output.type === OutputType.Foundry) {
            const foundryOutput = output as FoundryOutput;
            const unlockConditions = foundryOutput.unlockConditions;
            const immutableAliasUnlockCondition = unlockConditions[0] as ImmutableAliasAddressUnlockCondition;
            const aliasId = (immutableAliasUnlockCondition.address as AliasAddress).aliasId;
            const serialNumber = (output as FoundryOutput).serialNumber;
            const tokenSchemeType = (output as FoundryOutput).tokenScheme.type;

            return Utils.computeTokenId(aliasId, serialNumber, tokenSchemeType);
        }
    }

    /**
     * Get tooltip content for special condition i.e SDRUC, EUC and TUC.
     * @param unlockCondition Unlock condition of output.
     * @returns The tooltip content.
     */
    private getSpecialUnlockConditionContent(unlockCondition: IUnlockCondition): React.ReactNode {
        if (unlockCondition.type === UnlockConditionType.StorageDepositReturn) {
            const storageDepositReturnUC = unlockCondition as StorageDepositReturnUnlockCondition;
            return (
                <React.Fragment>
                    <span>Storage Deposit Return Unlock Condition</span> <br />
                    <span>Return Amount: {storageDepositReturnUC.amount} glow</span>
                </React.Fragment>
            );
        } else if (unlockCondition.type === UnlockConditionType.Expiration) {
            const expirationUnlockCondition = unlockCondition as ExpirationUnlockCondition;
            const time = DateHelper.format(DateHelper.milliseconds(expirationUnlockCondition.unixTime));
            return (
                <React.Fragment>
                    <span>Expiration Unlock Condition</span> <br />
                    <span>Time: {time} </span>
                </React.Fragment>
            );
        } else if (unlockCondition.type === UnlockConditionType.Timelock) {
            const timelockUnlockCondition = unlockCondition as TimelockUnlockCondition;
            const time = DateHelper.format(DateHelper.milliseconds(timelockUnlockCondition.unixTime));
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

        if (this.props.output.type !== OutputType.Treasury) {
            const commonOutput = this.props.output as CommonOutput;
            specialUnlockConditionExists = commonOutput.unlockConditions.some(
                (condition) =>
                    condition.type === UnlockConditionType.StorageDepositReturn ||
                    condition.type === UnlockConditionType.Expiration ||
                    condition.type === UnlockConditionType.Timelock,
            );
        }
        return specialUnlockConditionExists;
    }
}

export default Output;
