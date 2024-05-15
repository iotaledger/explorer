import {
    AccountAddress,
    AccountOutput,
    AnchorOutput,
    CommonOutput,
    DelegationOutput,
    ExpirationUnlockCondition,
    FoundryOutput,
    NftAddress,
    NftOutput,
    Output,
    OutputType,
    SimpleTokenScheme,
    StorageDepositReturnUnlockCondition,
    TimelockUnlockCondition,
    TokenSchemeType,
    UnlockCondition,
    UnlockConditionType,
    Utils,
} from "@iota/sdk-wasm-nova/web";
import bigInt from "big-integer";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "~/helpers/dateHelper";
import { useNovaTimeConvert } from "~/helpers/nova/hooks/useNovaTimeConvert";
import { OutputManaDetails, getManaKeyValueEntries } from "~/helpers/nova/manaUtils";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { hasSpecialCondition, isOutputExpired, isOutputTimeLocked } from "~/helpers/nova/outputUtils";
import { HexHelper } from "~/helpers/stardust/hexHelper";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import { IPreExpandedConfig } from "~models/components";
import CopyButton from "../CopyButton";
import Tooltip from "../Tooltip";
import TruncatedId from "../stardust/TruncatedId";
import FeatureView from "./FeatureView";
import KeyValueEntries from "./KeyValueEntries";
import "./OutputView.scss";
import UnlockConditionView from "./UnlockConditionView";
import { NameHelper } from "~/helpers/nova/nameHelper";

interface OutputViewProps {
    outputId: string;
    output: Output;
    showCopyAmount: boolean;
    preExpandedConfig?: IPreExpandedConfig;
    isLinksDisabled?: boolean;
    manaDetails?: OutputManaDetails | null;
}

export const EPOCH_HINT =
    "When the end epoch is set to 0, it indicates that no specific end epoch has been defined for this delegation output.";

const OutputView: React.FC<OutputViewProps> = ({ outputId, output, showCopyAmount, preExpandedConfig, isLinksDisabled, manaDetails }) => {
    const { manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [isExpanded, setIsExpanded] = useState(preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.isPreExpanded ?? false);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);
    const { bech32Hrp, name: network, protocolInfo, tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { slotIndexToUnixTimeRange } = useNovaTimeConvert();

    const accountOrNftBech32 = buildAddressForAccountOrNft(outputId, output, bech32Hrp);
    const outputIdTransactionPart = `${outputId.slice(0, 8)}....${outputId.slice(-8, -4)}`;
    const outputIdIndexPart = outputId.slice(-4);
    const manaEntries = manaDetails ? getManaKeyValueEntries(manaDetails, manaInfo, output.type === OutputType.Delegation) : undefined;
    const isSpecialCondition = hasSpecialCondition(output as CommonOutput);
    const validatorAddress =
        output.type === OutputType.Delegation ? Utils.addressToBech32((output as DelegationOutput).validatorAddress, bech32Hrp) : "";
    const delegationId = getDelegationId(outputId, output);

    useEffect(() => {
        setIsExpanded(preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.isPreExpanded ?? isExpanded ?? false);
    }, [preExpandedConfig]);

    const specialUnlockCondition =
        isSpecialCondition &&
        (output as CommonOutput).unlockConditions.map((unlockCondition, idx) => {
            const isExpired =
                unlockCondition.type === UnlockConditionType.Expiration && (isOutputExpired(output as CommonOutput, protocolInfo) ?? false);
            const isTimeLocked =
                unlockCondition.type === UnlockConditionType.Timelock && isOutputTimeLocked(output as CommonOutput, protocolInfo);
            return (
                <Tooltip key={idx} tooltipContent={getSpecialUnlockConditionContent(unlockCondition, slotIndexToUnixTimeRange, isExpired)}>
                    <span className={classNames("material-icons unlock-condition-icon", { expired: isExpired || isTimeLocked })}>
                        {unlockCondition.type === UnlockConditionType.StorageDepositReturn && "arrow_back"}
                        {unlockCondition.type === UnlockConditionType.Expiration && "hourglass_bottom"}
                        {unlockCondition.type === UnlockConditionType.Timelock && "schedule"}
                    </span>
                </Tooltip>
            );
        });

    const header = (
        <div onClick={() => setIsExpanded(!isExpanded)} className="card--value card-header--wrapper">
            <div className="output-header">
                <div
                    className={classNames("card--content--dropdown", {
                        opened: isExpanded,
                    })}
                >
                    <DropdownIcon />
                </div>
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
            <div className="row middle">
                {showCopyAmount && (
                    <div className="card--value pointer amount-size row end">
                        <span
                            className="pointer"
                            onClick={(e) => {
                                setIsFormattedBalance(!isFormattedBalance);
                                e.stopPropagation();
                            }}
                        >
                            {formatAmount(output.amount, tokenInfo, !isFormattedBalance)}
                        </span>
                    </div>
                )}
                {showCopyAmount && <CopyButton copy={output.amount} />}
            </div>
        </div>
    );

    const topLevelFields = (
        <React.Fragment>
            {output.type === OutputType.Account && (
                <React.Fragment>
                    <div className="card--label">Account address:</div>
                    <div className="card--value">
                        <TruncatedId
                            id={accountOrNftBech32}
                            link={isLinksDisabled ? undefined : `/${network}/addr/${accountOrNftBech32}`}
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
                            id={accountOrNftBech32}
                            link={isLinksDisabled ? undefined : `/${network}/addr/${accountOrNftBech32}`}
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
            {output.type !== OutputType.Foundry && manaEntries && manaDetails?.totalMana && (
                <KeyValueEntries isPreExpanded={true} {...manaEntries} />
            )}
            {output.type === OutputType.Delegation && (
                <React.Fragment>
                    <div className="card--label">Delegated amount:</div>
                    <div className="card--value row">
                        <span
                            className="pointer"
                            onClick={(e) => {
                                setIsFormattedBalance(!isFormattedBalance);
                                e.stopPropagation();
                            }}
                        >
                            {formatAmount(Number((output as DelegationOutput).delegatedAmount), tokenInfo, !isFormattedBalance)}
                        </span>
                    </div>
                    <div className="card--label">Delegation Id:</div>
                    <div className="card--value row">{delegationId}</div>
                    <div className="card--label">Validator Address:</div>
                    <div className="card--value row">
                        <TruncatedId
                            id={validatorAddress}
                            link={isLinksDisabled ? undefined : `/${network}/addr/${validatorAddress}`}
                            showCopyButton
                        />
                    </div>
                    <div className="card--label">Start epoch:</div>
                    <div className="card--value row">
                        <TruncatedId
                            id={(output as DelegationOutput).startEpoch.toString()}
                            link={
                                isLinksDisabled || (output as DelegationOutput).startEpoch === 0
                                    ? undefined
                                    : `/${network}/epoch/${(output as DelegationOutput).startEpoch}`
                            }
                            showCopyButton={false}
                        />
                    </div>
                    <div className="card--label">End epoch:</div>
                    <div className="card--value row epoch-info">
                        <TruncatedId
                            id={(output as DelegationOutput).endEpoch.toString()}
                            link={
                                isLinksDisabled || (output as DelegationOutput).endEpoch === 0
                                    ? undefined
                                    : `/${network}/epoch/${(output as DelegationOutput).endEpoch}`
                            }
                            showCopyButton={false}
                        />
                        {(output as DelegationOutput).endEpoch === 0 && (
                            <Tooltip tooltipContent={EPOCH_HINT}>
                                <div className="modal--icon">
                                    <span className="material-icons">info</span>
                                </div>
                            </Tooltip>
                        )}
                    </div>
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
                    {(output as CommonOutput).unlockConditions?.map((unlockCondition, idx) => {
                        const isPreExpanded = preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.unlockConditions?.[idx] ?? false;
                        return <UnlockConditionView key={idx} unlockCondition={unlockCondition} isPreExpanded={isPreExpanded} />;
                    })}
                    {output.type !== OutputType.Delegation &&
                        (output as CommonOutput).features?.map((feature, idx) => {
                            const isPreExpanded = preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.features?.[idx] ?? false;
                            return <FeatureView key={idx} feature={feature} isPreExpanded={isPreExpanded} isImmutable={false} />;
                        })}
                    {output.type === OutputType.Account &&
                        (output as AccountOutput).immutableFeatures?.map((immutableFeature, idx) => {
                            const isPreExpanded =
                                preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.immutableFeatures?.[idx] ?? false;
                            return <FeatureView key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} isImmutable={true} />;
                        })}
                    {output.type === OutputType.Anchor &&
                        (output as AnchorOutput).immutableFeatures?.map((immutableFeature, idx) => {
                            const isPreExpanded =
                                preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.immutableFeatures?.[idx] ?? false;
                            return <FeatureView key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} isImmutable={true} />;
                        })}
                    {output.type === OutputType.Nft &&
                        (output as NftOutput).immutableFeatures?.map((immutableFeature, idx) => {
                            const isPreExpanded =
                                preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.immutableFeatures?.[idx] ?? false;
                            return <FeatureView key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} isImmutable={true} />;
                        })}
                    {output.type === OutputType.Foundry &&
                        (output as FoundryOutput).immutableFeatures?.map((immutableFeature, idx) => {
                            const isPreExpanded =
                                preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.immutableFeatures?.[idx] ?? false;
                            return <FeatureView key={idx} feature={immutableFeature} isPreExpanded={isPreExpanded} isImmutable={true} />;
                        })}
                </div>
            )}
        </div>
    );
};

function buildAddressForAccountOrNft(outputId: string, output: Output, bech32Hrp: string): string {
    let bech32: string = "";

    if (output.type === OutputType.Account) {
        const accountIdFromOutput = (output as AccountOutput).accountId;
        const accountId = HexHelper.toBigInt256(accountIdFromOutput).eq(bigInt.zero)
            ? Utils.computeAccountId(outputId)
            : accountIdFromOutput;
        const accountAddress = new AccountAddress(accountId);
        bech32 = Utils.addressToBech32(accountAddress, bech32Hrp);
    } else if (output.type === OutputType.Nft) {
        const nftIdFromOutput = (output as NftOutput).nftId;
        const nftId = HexHelper.toBigInt256(nftIdFromOutput).eq(bigInt.zero) ? Utils.computeNftId(outputId) : nftIdFromOutput;
        const nftAddress = new NftAddress(nftId);
        bech32 = Utils.addressToBech32(nftAddress, bech32Hrp);
    }

    return bech32;
}

/**
 * Get delegation id for Delegation output.
 * @param outputId The id of the output.
 * @param output The output.
 * @returns The delegation id.
 */
function getDelegationId(outputId: string, output: Output): string {
    let delegationId: string = "";

    if (output.type === OutputType.Delegation) {
        const delegationIdFromOutput = (output as DelegationOutput).delegationId;
        delegationId = HexHelper.toBigInt256(delegationIdFromOutput).eq(bigInt.zero)
            ? Utils.computeDelegationId(outputId)
            : delegationIdFromOutput;
    }

    return delegationId;
}

/**
 * Get tooltip content for special condition i.e SDRUC, EUC and TUC.
 * @param unlockCondition Unlock condition of output.
 * @returns The tooltip content.
 */
function getSpecialUnlockConditionContent(
    unlockCondition: UnlockCondition,
    slotIndexToUnixTimeRange:
        | ((slotIndex: number) => {
              from: number;
              to: number;
          })
        | null,
    isExpiredOrTimeLocked: boolean,
): React.ReactNode {
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
        const eucSlot = expirationUnlockCondition.slot;
        const slotTimeRange = slotIndexToUnixTimeRange ? slotIndexToUnixTimeRange(eucSlot) : null;
        const time = slotTimeRange ? DateHelper.format(DateHelper.milliseconds(slotTimeRange?.from)) : null;
        return (
            <React.Fragment>
                <span>Expiration Unlock Condition{isExpiredOrTimeLocked ? " (Expired)" : ""}</span> <br />
                {time ? <span>Time: {time} </span> : <span>Slot: {eucSlot}</span>}
            </React.Fragment>
        );
    } else if (unlockCondition.type === UnlockConditionType.Timelock) {
        const timelockUnlockCondition = unlockCondition as TimelockUnlockCondition;
        const slotTimeRange = slotIndexToUnixTimeRange ? slotIndexToUnixTimeRange(timelockUnlockCondition.slot) : null;
        const time = slotTimeRange ? DateHelper.format(DateHelper.milliseconds(slotTimeRange?.from)) : null;
        return (
            <React.Fragment>
                <span>Timelock Unlock Condition{isExpiredOrTimeLocked ? " (TimeLocked)" : ""}</span> <br />
                {time ? <span>Time: {time} </span> : <span>Slot: {timelockUnlockCondition.slot}</span>}
            </React.Fragment>
        );
    }
}

export default OutputView;
