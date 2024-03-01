import { INodeInfoBaseToken } from "@iota/sdk-wasm-nova/web";
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
    readonly totalBaseTokenBalance: number | null;
    /**
     * The trivially unlockable portion of the base token balance (from chronicle).
     */
    readonly availableBaseTokenBalance: number | null;
    /**
     * The mana totalBalance amount from chronicle (representing trivial + conditional balance).
     */
    readonly totalManaBalance: IManaBalance | null;
    /**
     * The trivially unlockable portion of the mana balance (from chronicle).
     */
    readonly availableManaBalance: IManaBalance | null;
    /**
     * The storage rent balance.
     */
    readonly storageDeposit: number | null;
}

const CONDITIONAL_BALANCE_INFO =
    "These funds reside within outputs with additional unlock conditions which might be potentially un-lockable";

const AddressBalance: React.FC<AddressBalanceProps> = ({
    totalBaseTokenBalance,
    availableBaseTokenBalance,
    totalManaBalance,
    availableManaBalance,
    storageDeposit,
}) => {
    const { tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [formatBalanceFull, setFormatBalanceFull] = useState(false);
    const [formatConditionalBalanceFull, setFormatConditionalBalanceFull] = useState(false);
    const [formatStorageBalanceFull, setFormatStorageBalanceFull] = useState(false);

    if (totalBaseTokenBalance === null) {
        return null;
    }

    const baseTokenBalanceView = buildBaseTokenBalanceView(tokenInfo);
    const manaBalanceView = buildManaBalanceView(tokenInfo);

    const conditionalBaseTokenBalance = availableBaseTokenBalance === null ? undefined : totalBaseTokenBalance - availableBaseTokenBalance;
    const shouldShowExtendedBalance = conditionalBaseTokenBalance !== undefined && availableBaseTokenBalance !== undefined;

    const totalStoredMana = totalManaBalance?.stored ?? null;
    const totalPotentialMana = totalManaBalance?.potential ?? null;
    const availableStoredMana = availableManaBalance?.stored ?? null;
    const availablePotentialMana = availableManaBalance?.potential ?? null;

    const conditionalStoredMana = availableStoredMana === null || totalStoredMana === null ? null : totalStoredMana - availableStoredMana;
    const conditionalPotentialMana =
        availablePotentialMana === null || totalPotentialMana === null ? null : totalPotentialMana - availablePotentialMana;

    return (
        <div className="balance-wrapper">
            <Icon icon="wallet" boxed />
            <div className="balance-wrapper__inner">
                <div className="balance-wrapper__base-token">
                    {baseTokenBalanceView(
                        "Available Base Token",
                        formatBalanceFull,
                        setFormatBalanceFull,
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
                    {(totalStoredMana !== null || totalPotentialMana !== null) &&
                        manaBalanceView("Available Mana", formatBalanceFull, setFormatBalanceFull, totalStoredMana, totalPotentialMana)}
                    {conditionalStoredMana !== null ||
                        (conditionalPotentialMana !== null &&
                            manaBalanceView(
                                "Conditionally Locked Mana",
                                formatBalanceFull,
                                setFormatBalanceFull,
                                conditionalStoredMana,
                                conditionalPotentialMana,
                            ))}
                </div>
            </div>
        </div>
    );
};

function buildBaseTokenBalanceView(tokenInfo: INodeInfoBaseToken) {
    const baseTokenBalanceView = (
        label: string,
        isFormatFull: boolean,
        setIsFormatFull: React.Dispatch<React.SetStateAction<boolean>>,
        showInfo: boolean,
        amount: number | null,
    ) => (
        <div className="balance">
            <div>
                <div className="row middle balance-heading">
                    <div className="label">{label}</div>
                    {showInfo && (
                        <Tooltip tooltipContent={CONDITIONAL_BALANCE_INFO}>
                            <span className="material-icons">info</span>
                        </Tooltip>
                    )}
                </div>
                <div className="value featured">
                    {amount !== null && amount > 0 ? (
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
        </div>
    );

    return baseTokenBalanceView;
}

function buildManaBalanceView(tokenInfo: INodeInfoBaseToken) {
    const manaBalanceView = (
        label: string,
        isFormatFull: boolean,
        setIsFormatFull: React.Dispatch<React.SetStateAction<boolean>>,
        storedMana: number | null,
        potentialMana: number | null,
    ) => (
        <div className="balance">
            <div>
                <div className="row middle balance-heading">
                    <div className="label">{label}</div>
                </div>
                <div className="balance__mana">
                    <div className="label">Stored:</div>
                    <div className="value featured">
                        {storedMana !== null && storedMana > 0 ? (
                            <div className="balance-value middle">
                                <div className="row middle">
                                    <span onClick={() => setIsFormatFull(!isFormatFull)} className="balance-base-token pointer margin-r-5">
                                        {formatAmount(storedMana, tokenInfo, isFormatFull)}
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
                    <div className="label">Potential:</div>
                    <div className="value featured">
                        {potentialMana !== null && potentialMana > 0 ? (
                            <div className="balance-value middle">
                                <div className="row middle">
                                    <span onClick={() => setIsFormatFull(!isFormatFull)} className="balance-base-token pointer margin-r-5">
                                        {formatAmount(potentialMana, tokenInfo, isFormatFull)}
                                    </span>
                                    <CopyButton copy={String(potentialMana)} />
                                </div>
                            </div>
                        ) : (
                            <span className="margin-r-5">0</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return manaBalanceView;
}

export default AddressBalance;
