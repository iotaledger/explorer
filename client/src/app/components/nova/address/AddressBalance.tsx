import { BaseTokenResponse } from "@iota/sdk-wasm-nova/web";
import React, { useState } from "react";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import CopyButton from "../../CopyButton";
import Icon from "../../Icon";
import Tooltip from "../../Tooltip";
import "./AddressBalance.scss";
import { CardInfo } from "~app/components/CardInfo";

interface AddressBalanceProps {
    /**
     * The base token totalBalance amount from chronicle (representing trivial + conditional balance).
     */
    readonly totalBaseTokenBalance?: number | null;
    /**
     * The trivially unlockable portion of the base token balance (from chronicle).
     */
    readonly availableBaseTokenBalance?: number | null;
    /**
     * The mana totalBalance amount from chronicle (representing trivial + conditional balance).
     */
    readonly totalManaBalance?: IManaBalance | null;
    /**
     * The trivially unlockable portion of the mana balance (from chronicle).
     */
    readonly availableManaBalance?: IManaBalance | null;
    /**
     * The block issuance credits (for Account addresses).
     */
    readonly blockIssuanceCredits?: bigint | null;
    /**
     * The account mana rewards (for Account addresses).
     */
    readonly manaRewards?: bigint | null;
    /**
     * The storage rent balance.
     */
    readonly storageDeposit?: number | null;
}

const CONDITIONAL_BALANCE_INFO =
    "These funds reside within outputs with additional unlock conditions which might be potentially un-lockable";

const AddressBalance: React.FC<AddressBalanceProps> = ({
    totalBaseTokenBalance,
    availableBaseTokenBalance,
    totalManaBalance,
    availableManaBalance,
    blockIssuanceCredits,
    manaRewards,
    storageDeposit,
}) => {
    const { tokenInfo, manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [formatBaseTokenBalanceFull, setFormatBaseTokenBalanceFull] = useState(false);
    const [formatManaBalanceFull, setFormatManaBalanceFull] = useState(false);
    const [formatConditionalBalanceFull, setFormatConditionalBalanceFull] = useState(false);
    const [formatStorageBalanceFull, setFormatStorageBalanceFull] = useState(false);

    if (totalBaseTokenBalance === null) {
        return null;
    }

    const baseTokenBalanceView = buildBaseTokenBalanceView(tokenInfo);
    const manaBalanceView = buildManaBalanceView(manaInfo);

    const conditionalBaseTokenBalance =
        !availableBaseTokenBalance || !totalBaseTokenBalance ? undefined : totalBaseTokenBalance - availableBaseTokenBalance;
    const shouldShowExtendedBalance = conditionalBaseTokenBalance !== undefined && availableBaseTokenBalance !== undefined;

    const totalStoredMana = totalManaBalance?.stored ?? null;
    const totalPotentialMana = totalManaBalance?.potential ?? null;
    const totalDecayMana = totalManaBalance?.decay ?? null;
    const availableStoredMana = availableManaBalance?.stored ?? null;
    const availablePotentialMana = availableManaBalance?.potential ?? null;
    const availableDecayMana = availableManaBalance?.decay ?? null;

    const conditionalStoredMana = availableStoredMana === null || totalStoredMana === null ? null : totalStoredMana - availableStoredMana;
    const conditionalDecayMana = availableDecayMana === null || totalDecayMana === null ? null : totalDecayMana - availableDecayMana;
    const conditionalPotentialMana =
        availablePotentialMana === null || totalPotentialMana === null ? null : totalPotentialMana - availablePotentialMana;

    const availableBaseTokenAmount = (() => {
        const balance = shouldShowExtendedBalance ? availableBaseTokenBalance : totalBaseTokenBalance;
        return balance && balance > 0 ? formatAmount(balance, tokenInfo, formatBaseTokenBalanceFull) : 0;
    })();

    const manaFactory = (
        mana: bigint | number | null | undefined,
        title: string,
        isFormat: boolean,
        setFormat: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        if (mana !== null && mana !== undefined && mana > 0) {
            return {
                title: title,
                amount: formatAmount(mana, manaInfo, isFormat),
                copyAmount: String(mana),
                onClickAmount: () => setFormat(!isFormat)
            };
        }

        return null;
    };


    return (
        <div className="balance-wrapper">
            <div className="balance-wrapper--row">
                <CardInfo
                    title="Available Base Token"
                    amount={availableBaseTokenAmount}
                    onClickAmount={() => setFormatBaseTokenBalanceFull(!formatBaseTokenBalanceFull)}
                    tokenInfo={tokenInfo}
                    copyAmount={String(availableBaseTokenAmount)}
                    details={[]}
                />
                {shouldShowExtendedBalance && (
                    <CardInfo
                        title="Conditionally Locked Base Token"
                        amount={formatAmount(conditionalBaseTokenBalance, tokenInfo, formatConditionalBalanceFull)}
                        onClickAmount={() => setFormatConditionalBalanceFull(!formatConditionalBalanceFull)}
                        tokenInfo={tokenInfo}
                        copyAmount={String(conditionalBaseTokenBalance)}
                        tooltip={CONDITIONAL_BALANCE_INFO}
                    />
                )}

                <CardInfo
                    title="Storage Deposit"
                    amount={storageDeposit ? formatAmount(storageDeposit, tokenInfo, formatStorageBalanceFull) : 0}
                    onClickAmount={() => setFormatStorageBalanceFull(!formatStorageBalanceFull)}
                    tokenInfo={tokenInfo}
                    copyAmount={String(storageDeposit)}
                />
            </div>
            <div className="balance-wrapper--row">
                <CardInfo
                    title="Available Mana"
                    tokenInfo={tokenInfo}
                    details={[
                        manaFactory(availableStoredMana, "Stored:", formatManaBalanceFull, setFormatManaBalanceFull),
                        manaFactory(availableDecayMana, "Decay:", formatManaBalanceFull, setFormatManaBalanceFull),
                        manaFactory(availablePotentialMana, "Potential:", formatManaBalanceFull, setFormatManaBalanceFull),
                        manaFactory(blockIssuanceCredits, "Block issuance credits:", formatManaBalanceFull, setFormatManaBalanceFull),
                        manaFactory(manaRewards, "Mana rewards:", formatManaBalanceFull, setFormatManaBalanceFull),
                    ]}
                />

                <CardInfo
                    title="Conditionally Locked Mana"
                    tokenInfo={tokenInfo}
                    details={[
                        manaFactory(conditionalStoredMana, "Stored:", formatStorageBalanceFull, setFormatStorageBalanceFull),
                        manaFactory(conditionalDecayMana, "Decay:", formatStorageBalanceFull, setFormatStorageBalanceFull),
                        manaFactory(conditionalPotentialMana, "Potential:", formatStorageBalanceFull, setFormatStorageBalanceFull),
                    ]}
                />
            </div>
            <div className="balance-wrapper--row">
                <div className="balance-wrapper__mana">

                    {(conditionalStoredMana !== null || conditionalPotentialMana !== null) &&
                        manaBalanceView(
                            "Conditionally Locked Mana",
                            formatStorageBalanceFull,
                            setFormatStorageBalanceFull,
                            conditionalStoredMana,
                            conditionalDecayMana,
                            conditionalPotentialMana,
                        )}
                </div>
            </div>
        </div>
    );
};

function buildBaseTokenBalanceView(tokenInfo: BaseTokenResponse) {
    const baseTokenBalanceView = (
        label: string,
        isFormatFull: boolean,
        setIsFormatFull: React.Dispatch<React.SetStateAction<boolean>>,
        showInfo: boolean,
        amount?: number | null,
    ) => (
        <div className="balance">
            <div className="row middle balance-heading">
                <div className="label">{label}</div>
                {showInfo && (
                    <Tooltip tooltipContent={CONDITIONAL_BALANCE_INFO}>
                        <span className="material-icons">info</span>
                    </Tooltip>
                )}
            </div>
            <div className="value featured">
                {amount && amount > 0 ? (
                    <div className="balance-value middle">
                        <div className="row middle">
                            <span onClick={() => setIsFormatFull(!isFormatFull)} className="balance-base-token pointer margin-r-5">
                                {formatAmount(amount, tokenInfo, isFormatFull)}
                            </span>
                            <CopyButton copy={String(amount)} />
                        </div>
                    </div>
                ) : (
                    <span className="margin-r-5">0</span>
                )}
            </div>
        </div>
    );

    return baseTokenBalanceView;
}

function buildManaBalanceView(manaInfo: BaseTokenResponse) {
    const manaTokenBalanceView = (
        label: string,
        isFormatFull: boolean,
        setIsFormatFull: React.Dispatch<React.SetStateAction<boolean>>,
        storedMana: number | null,
        decayMana: number | null,
        potentialMana: number | null,
        blockIssuanceCredits: bigint | null = null,
        manaRewards: bigint | null = null,
    ) => (
        <div className="balance">
            <div className="row middle balance-heading">
                <div className="label">{label}</div>
            </div>
            <div className="balance__mana">
                <div className="label">Stored:</div>
                <div className="value featured">
                    {storedMana !== null && storedMana > 0 ? (
                        <div className="balance-value middle">
                            <div className="row middle">
                                <span className="balance-base-token pointer margin-r-5" onClick={() => setIsFormatFull(!isFormatFull)}>
                                    {formatAmount(storedMana, manaInfo, isFormatFull)}
                                </span>
                                <CopyButton copy={String(storedMana)} />
                            </div>
                        </div>
                    ) : (
                        <span className="margin-r-5">0</span>
                    )}
                </div>
            </div>
            <div className="balance__mana">
                <div className="label">Decay:</div>
                <div className="value featured">
                    {decayMana !== null && decayMana > 0 ? (
                        <div className="balance-value middle">
                            <div className="row middle">
                                <span className="balance-base-token pointer margin-r-5" onClick={() => setIsFormatFull(!isFormatFull)}>
                                    {formatAmount(decayMana, manaInfo, isFormatFull)}
                                </span>
                                <CopyButton copy={String(decayMana)} />
                            </div>
                        </div>
                    ) : (
                        <span className="margin-r-5">0</span>
                    )}
                </div>
            </div>
            <div className="balance__mana">
                <div className="label">Potential:</div>
                <div className="value featured">
                    {potentialMana !== null && potentialMana > 0 ? (
                        <div className="balance-value middle">
                            <div className="row middle">
                                <span className="balance-base-token pointer margin-r-5" onClick={() => setIsFormatFull(!isFormatFull)}>
                                    {formatAmount(potentialMana, manaInfo, isFormatFull)}
                                </span>
                                <CopyButton copy={String(potentialMana)} />
                            </div>
                        </div>
                    ) : (
                        <span className="margin-r-5">0</span>
                    )}
                </div>
            </div>
            {blockIssuanceCredits !== null && (
                <div className="balance__mana">
                    <div className="label">Block issuance credits:</div>
                    <div className="value featured">
                        {blockIssuanceCredits && blockIssuanceCredits > 0 ? (
                            <div className="balance-value middle">
                                <div className="row middle">
                                    <span className="balance-base-token pointer margin-r-5" onClick={() => setIsFormatFull(!isFormatFull)}>
                                        {formatAmount(blockIssuanceCredits.toString(), manaInfo, isFormatFull)}
                                    </span>
                                    <CopyButton copy={blockIssuanceCredits.toString()} />
                                </div>
                            </div>
                        ) : (
                            <span className="margin-r-5">0</span>
                        )}
                    </div>
                </div>
            )}
            {manaRewards !== null && (
                <div className="balance__mana">
                    <div className="label">Mana rewards:</div>
                    <div className="value featured">
                        {manaRewards && manaRewards > 0 ? (
                            <div className="balance-value middle">
                                <div className="row middle">
                                    <span className="balance-base-token pointer margin-r-5" onClick={() => setIsFormatFull(!isFormatFull)}>
                                        {formatAmount(manaRewards.toString(), manaInfo, isFormatFull)}
                                    </span>
                                    <CopyButton copy={manaRewards.toString()} />
                                </div>
                            </div>
                        ) : (
                            <span className="margin-r-5">0</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return manaTokenBalanceView;
}

AddressBalance.defaultProps = {
    totalBaseTokenBalance: null,
    availableBaseTokenBalance: null,
    totalManaBalance: null,
    availableManaBalance: null,
    blockIssuanceCredits: null,
    manaRewards: null,
    storageDeposit: null,
};

export default AddressBalance;
