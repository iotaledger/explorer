import { BaseTokenResponse } from "@iota/sdk-wasm-nova/web";
import React, { useState } from "react";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import CopyButton from "../../CopyButton";
import Icon from "../../Icon";
import Tooltip from "../../Tooltip";
import "./AddressBalance.scss";

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

    return (
        <div className="balance-wrapper">
            <Icon icon="wallet" boxed />
            <div className="balance-wrapper__inner">
                <div className="balance-wrapper__base-token">
                    {baseTokenBalanceView(
                        "Available Base Token",
                        formatBaseTokenBalanceFull,
                        setFormatBaseTokenBalanceFull,
                        false,
                        shouldShowExtendedBalance ? availableBaseTokenBalance : totalBaseTokenBalance,
                    )}
                    {shouldShowExtendedBalance &&
                        baseTokenBalanceView(
                            "Conditionally Locked Base Token",
                            formatConditionalBalanceFull,
                            setFormatConditionalBalanceFull,
                            true,
                            conditionalBaseTokenBalance,
                        )}
                    {baseTokenBalanceView("Storage Deposit", formatStorageBalanceFull, setFormatStorageBalanceFull, false, storageDeposit)}
                </div>

                <div className="balance-wrapper__mana">
                    {(availableStoredMana !== null ||
                        availablePotentialMana !== null ||
                        availableDecayMana !== null ||
                        blockIssuanceCredits !== null) &&
                        manaBalanceView(
                            "Available Mana",
                            formatManaBalanceFull,
                            setFormatManaBalanceFull,
                            availableStoredMana,
                            availableDecayMana,
                            availablePotentialMana,
                            blockIssuanceCredits,
                            manaRewards,
                        )}
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
