import React, { useState } from "react";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import "./AddressBalance.scss";
import { CardInfo, CardInfoDetail } from "~app/components/CardInfo";
import { NumberHelper } from "~helpers/numberHelper";

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

type FormatField =
    | "baseTokenBalance"
    | "conditionalBaseTokenBalance"
    | "storageDeposit"
    | "availableManaBalance"
    | "availableStoredMana"
    | "availableDecayMana"
    | "availablePotentialMana"
    | "blockIssuanceCredits"
    | "manaRewards"
    | "conditionallyLockedMana"
    | "conditionalStoredMana"
    | "conditionalDecayMana"
    | "conditionalPotentialMana";

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
    const [isFormat, setIsFormat] = useState<{ [k in FormatField]: boolean }>({
        baseTokenBalance: false,
        conditionalBaseTokenBalance: false,
        storageDeposit: false,

        availableManaBalance: false,
        availableStoredMana: false,
        availableDecayMana: false,
        availablePotentialMana: false,
        blockIssuanceCredits: false,
        manaRewards: false,

        conditionallyLockedMana: false,
        conditionalStoredMana: false,
        conditionalDecayMana: false,
        conditionalPotentialMana: false,
    });

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
        const balance = (shouldShowExtendedBalance ? availableBaseTokenBalance : totalBaseTokenBalance) || 0;
        return {
            formatted: formatAmount(balance, tokenInfo, isFormat.baseTokenBalance),
            full: balance,
        };
    })();

    const manaFactory = (
        mana: bigint | number | null | undefined,
        title: string,
        isFormat: boolean,
        toggleFormat: () => void,
    ): CardInfoDetail | null => {
        if (mana !== null && mana !== undefined) {
            return {
                title: title,
                value: formatAmount(mana, manaInfo, isFormat),
                onClickValue: toggleFormat,
                copyValue: String(mana),
            };
        }

        return {
            title: title,
            value: formatAmount(0, manaInfo, isFormat),
            onClickValue: toggleFormat,
            copyValue: "0",
        };
    };

    const availableManaSum = NumberHelper.sumValues(
        availableStoredMana,
        availableDecayMana,
        availablePotentialMana,
        blockIssuanceCredits,
        manaRewards,
    );
    const conditionallyLockedManaSum = NumberHelper.sumValues(conditionalStoredMana, conditionalDecayMana, conditionalPotentialMana);

    const toggleFormat = (field: FormatField) => () => {
        setIsFormat((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="balance-wrapper nova">
            <div className="balance-wrapper--row">
                <CardInfo
                    title="Available Base Token"
                    value={availableBaseTokenAmount.formatted}
                    onClickValue={toggleFormat("baseTokenBalance")}
                    copyValue={String(availableBaseTokenAmount.full)}
                />
                {shouldShowExtendedBalance && (
                    <CardInfo
                        title="Conditionally Locked Base Token"
                        value={formatAmount(conditionalBaseTokenBalance, tokenInfo, isFormat.conditionalBaseTokenBalance)}
                        onClickValue={toggleFormat("conditionalBaseTokenBalance")}
                        tooltip={CONDITIONAL_BALANCE_INFO}
                        copyValue={String(conditionalBaseTokenBalance)}
                    />
                )}

                <CardInfo
                    title="Storage Deposit"
                    value={formatAmount(storageDeposit || 0, tokenInfo, isFormat.storageDeposit)}
                    onClickValue={toggleFormat("storageDeposit")}
                    copyValue={String(storageDeposit || 0)}
                />
            </div>
            <div className="balance-wrapper--row">
                <CardInfo
                    title="Available Mana"
                    value={formatAmount(availableManaSum, manaInfo, isFormat.availableManaBalance)}
                    onClickValue={toggleFormat("availableManaBalance")}
                    copyValue={String(availableManaSum)}
                    options={{ headerDirectionRow: true }}
                    details={[
                        manaFactory(availableStoredMana, "Stored:", isFormat.availableStoredMana, toggleFormat("availableStoredMana")),
                        manaFactory(availableDecayMana, "Decay:", isFormat.availableDecayMana, toggleFormat("availableDecayMana")),
                        manaFactory(
                            availablePotentialMana,
                            "Potential:",
                            isFormat.availablePotentialMana,
                            toggleFormat("availablePotentialMana"),
                        ),
                        blockIssuanceCredits !== null
                            ? manaFactory(
                                  blockIssuanceCredits,
                                  "Block issuance credits:",
                                  isFormat.blockIssuanceCredits,
                                  toggleFormat("blockIssuanceCredits"),
                              )
                            : null,
                        manaRewards !== null
                            ? manaFactory(manaRewards, "Mana rewards:", isFormat.manaRewards, toggleFormat("manaRewards"))
                            : null,
                    ]}
                />

                <CardInfo
                    title="Conditionally Locked Mana"
                    value={formatAmount(conditionallyLockedManaSum, manaInfo, isFormat.conditionallyLockedMana)}
                    onClickValue={toggleFormat("conditionallyLockedMana")}
                    copyValue={String(conditionallyLockedManaSum)}
                    options={{ headerDirectionRow: true }}
                    details={[
                        manaFactory(
                            conditionalStoredMana,
                            "Stored:",
                            isFormat.conditionalStoredMana,
                            toggleFormat("conditionalStoredMana"),
                        ),
                        manaFactory(conditionalDecayMana, "Decay:", isFormat.conditionalDecayMana, toggleFormat("conditionalDecayMana")),
                        manaFactory(
                            conditionalPotentialMana,
                            "Potential:",
                            isFormat.conditionalPotentialMana,
                            toggleFormat("conditionalPotentialMana"),
                        ),
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
