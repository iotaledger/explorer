import React, { useState } from "react";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import "./AddressBalance.scss";
import { CardInfo, CardInfoDetail } from "~app/components/CardInfo";

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
        setFormat: React.Dispatch<React.SetStateAction<boolean>>,
    ): CardInfoDetail | null => {
        if (mana !== null && mana !== undefined && mana > 0) {
            return {
                title: title,
                value: formatAmount(mana, manaInfo, isFormat),
                onClickValue: () => setFormat(!isFormat),
                showCopyBtn: true,
            };
        }

        return {
            title: title,
            value: 0,
            onClickValue: () => {},
            showCopyBtn: false,
        };
    };

    return (
        <div className="balance-wrapper">
            <div className="balance-wrapper--row">
                <CardInfo
                    title="Available Base Token"
                    value={availableBaseTokenAmount}
                    onClickValue={() => setFormatBaseTokenBalanceFull(!formatBaseTokenBalanceFull)}
                    showCopyBtn
                />
                {shouldShowExtendedBalance && (
                    <CardInfo
                        title="Conditionally Locked Base Token"
                        value={formatAmount(conditionalBaseTokenBalance, tokenInfo, formatConditionalBalanceFull)}
                        onClickValue={() => setFormatConditionalBalanceFull(!formatConditionalBalanceFull)}
                        tooltip={CONDITIONAL_BALANCE_INFO}
                        showCopyBtn
                    />
                )}

                <CardInfo
                    title="Storage Deposit"
                    value={storageDeposit ? formatAmount(storageDeposit, tokenInfo, formatStorageBalanceFull) : 0}
                    onClickValue={() => setFormatStorageBalanceFull(!formatStorageBalanceFull)}
                    showCopyBtn
                />
            </div>
            <div className="balance-wrapper--row">
                <CardInfo
                    title="Available Mana"
                    details={[
                        manaFactory(availableStoredMana, "Stored:", formatManaBalanceFull, setFormatManaBalanceFull),
                        manaFactory(availableDecayMana, "Decay:", formatManaBalanceFull, setFormatManaBalanceFull),
                        manaFactory(availablePotentialMana, "Potential:", formatManaBalanceFull, setFormatManaBalanceFull),
                        blockIssuanceCredits !== null
                            ? manaFactory(blockIssuanceCredits, "Block issuance credits:", formatManaBalanceFull, setFormatManaBalanceFull)
                            : null,
                        manaRewards !== null
                            ? manaFactory(manaRewards, "Mana rewards:", formatManaBalanceFull, setFormatManaBalanceFull)
                            : null,
                    ]}
                />

                <CardInfo
                    title="Conditionally Locked Mana"
                    details={[
                        manaFactory(conditionalStoredMana, "Stored:", formatStorageBalanceFull, setFormatStorageBalanceFull),
                        manaFactory(conditionalDecayMana, "Decay:", formatStorageBalanceFull, setFormatStorageBalanceFull),
                        manaFactory(conditionalPotentialMana, "Potential:", formatStorageBalanceFull, setFormatStorageBalanceFull),
                    ]}
                />
            </div>
        </div>
    );
};

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
