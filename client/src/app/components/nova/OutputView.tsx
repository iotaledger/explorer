import React, { useState } from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import classNames from "classnames";
import {
    Output,
    OutputType,
    BasicOutput,
    CommonOutput,
    AccountOutput,
    AnchorOutput,
    FoundryOutput,
    NftOutput,
    TokenSchemeType,
    SimpleTokenScheme,
    DelegationOutput,
    Utils,
} from "@iota/sdk-wasm-nova/web";
import UnlockConditionView from "./UnlockConditionView";
import CopyButton from "../CopyButton";
import { Link } from "react-router-dom";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import FeatureView from "./FeaturesView";
import TruncatedId from "../stardust/TruncatedId";
import { HexHelper } from "~/helpers/stardust/hexHelper";
import bigInt from "big-integer";
import "./OutputView.scss";

interface OutputViewProps {
    outputId: string;
    output: Output;
    showCopyAmount: boolean;
    isPreExpanded?: boolean;
    isLinksDisabled?: boolean;
}

const OutputView: React.FC<OutputViewProps> = ({ outputId, output, showCopyAmount, isPreExpanded, isLinksDisabled }) => {
    const [isExpanded, setIsExpanded] = useState(isPreExpanded ?? false);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);
    const { bech32Hrp, name: network } = useNetworkInfoNova((s) => s.networkInfo);

    const aliasOrNftBech32 = buildAddressForAliasOrNft(outputId, output, bech32Hrp);
    const outputIdTransactionPart = `${outputId.slice(0, 8)}....${outputId.slice(-8, -4)}`;
    const outputIdIndexPart = outputId.slice(-4);

    const header = (
        <div onClick={() => setIsExpanded(!isExpanded)} className="card--value card-header--wrapper">
            <div
                className={classNames("card--content--dropdown", {
                    opened: isExpanded,
                })}
            >
                <DropdownIcon />
            </div>
            <div className="output-header">
                <button type="button" className="output-type--name color">
                    {getOutputTypeName(output.type)}
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
            </div>
            {showCopyAmount && (
                <div className="card--value pointer amount-size row end">
                    <span
                        className="pointer"
                        onClick={(e) => {
                            setIsFormattedBalance(!isFormattedBalance);
                            e.stopPropagation();
                        }}
                    >
                        {output.amount}
                    </span>
                </div>
            )}
            {showCopyAmount && <CopyButton copy={output.amount} />}
        </div>
    );

    const topLevelFields = (
        <React.Fragment>
            {output.type === OutputType.Account && (
                <React.Fragment>
                    <div className="card--label">Account address:</div>
                    <div className="card--value">
                        <TruncatedId
                            id={aliasOrNftBech32}
                            link={isLinksDisabled ? undefined : `/${network}/addr/${aliasOrNftBech32}`}
                            showCopyButton
                        />
                    </div>
                    <div className="card--label">Foundry counter:</div>
                    <div className="card--value row">{(output as AccountOutput).foundryCounter}</div>
                </React.Fragment>
            )}
            {output.type === OutputType.Anchor && (
                <React.Fragment>
                    <div className="card--label">Anchor Id:</div>
                    <div className="card--value">
                        <TruncatedId
                            id={(output as AnchorOutput).anchorId}
                            link={isLinksDisabled ? undefined : `/${network}/addr/${(output as AnchorOutput).anchorId}`}
                            showCopyButton
                        />
                    </div>
                    <div className="card--label">State index:</div>
                    <div className="card--value row">{(output as AnchorOutput).stateIndex}</div>
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
                    <div className="card--label">Serial number:</div>
                    <div className="card--value">{(output as FoundryOutput).serialNumber}</div>
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
            {(output.type === OutputType.Basic ||
                output.type === OutputType.Account ||
                output.type === OutputType.Anchor ||
                output.type === OutputType.Nft) && (
                <React.Fragment>
                    <div className="card--label">Stored mana:</div>
                    <div className="card--value row">{(output as BasicOutput).mana?.toString()}</div>
                </React.Fragment>
            )}
            {output.type === OutputType.Delegation && (
                <React.Fragment>
                    <div className="card--label">Delegated amount:</div>
                    <div className="card--value row">{Number((output as DelegationOutput).delegatedAmount)}</div>
                    <div className="card--label">Delegation Id:</div>
                    <div className="card--value row">{(output as DelegationOutput).delegationId}</div>
                    <div className="card--label">Validator Id:</div>
                    <div className="card--value row">{(output as DelegationOutput).validatorId}</div>
                    <div className="card--label">Start epoch:</div>
                    <div className="card--value row">{(output as DelegationOutput).startEpoch}</div>
                    <div className="card--label">End epoch:</div>
                    <div className="card--value row">{(output as DelegationOutput).endEpoch}</div>
                </React.Fragment>
            )}
        </React.Fragment>
    );

    return (
        <div className="card--content__output">
            {header}
            {isExpanded && (
                <div className="output padding-l-t left-border">
                    {topLevelFields}
                    {(output as CommonOutput).unlockConditions?.map((unlockCondition, idx) => (
                        <UnlockConditionView key={idx} unlockCondition={unlockCondition} isPreExpanded={true} />
                    ))}
                    {output.type !== OutputType.Delegation &&
                        (output as CommonOutput).features?.map((feature, idx) => (
                            <FeatureView key={idx} feature={feature} isPreExpanded={isPreExpanded} isImmutable={false} />
                        ))}
                    {output.type === OutputType.Account &&
                        (output as AccountOutput).immutableFeatures?.map((immutableFeature, idx) => (
                            <FeatureView key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} isImmutable={true} />
                        ))}
                    {output.type === OutputType.Anchor &&
                        (output as AnchorOutput).immutableFeatures?.map((immutableFeature, idx) => (
                            <FeatureView key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} isImmutable={true} />
                        ))}
                    {output.type === OutputType.Nft &&
                        (output as NftOutput).immutableFeatures?.map((immutableFeature, idx) => (
                            <FeatureView key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} isImmutable={true} />
                        ))}
                    {output.type === OutputType.Foundry &&
                        (output as FoundryOutput).immutableFeatures?.map((immutableFeature, idx) => (
                            <FeatureView key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} isImmutable={true} />
                        ))}
                </div>
            )}
        </div>
    );
};

function buildAddressForAliasOrNft(outputId: string, output: Output, bech32Hrp: string): string {
    let bech32: string = "";

    if (output.type === OutputType.Account) {
        const accountIdFromOutput = (output as AccountOutput).accountId;
        const accountId = HexHelper.toBigInt256(accountIdFromOutput).eq(bigInt.zero)
            ? Utils.computeAccountId(outputId)
            : accountIdFromOutput;
        bech32 = Utils.accountIdToBech32(accountId, bech32Hrp);
    } else if (output.type === OutputType.Nft) {
        const nftIdFromOutput = (output as NftOutput).nftId;
        const nftId = HexHelper.toBigInt256(nftIdFromOutput).eq(bigInt.zero) ? Utils.computeNftId(outputId) : nftIdFromOutput;
        bech32 = Utils.nftIdToBech32(nftId, bech32Hrp);
    }

    return bech32;
}

function getOutputTypeName(type: OutputType): string {
    switch (type) {
        case OutputType.Basic:
            return "Basic";
        case OutputType.Account:
            return "Account";
        case OutputType.Anchor:
            return "Anchor";
        case OutputType.Foundry:
            return "Foundry";
        case OutputType.Nft:
            return "Nft";
        case OutputType.Delegation:
            return "Delegation";
    }
}

export default OutputView;
