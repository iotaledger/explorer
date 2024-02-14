import React, { useState } from "react";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import CopyButton from "../../CopyButton";
import Icon from "../../Icon";
import Tooltip from "../../Tooltip";
import "./AddressBalance.scss";

interface AddressBalanceProps {
    /**
     * The totalBalance amount from chronicle (representing trivial + conditional balance).
     */
    readonly totalBalance: number;
    /**
     * The trivially unlockable portion of the balance, fetched from chronicle.
     */
    readonly availableBalance: number | null;
    /**
     * The storage rent balance.
     */
    readonly storageDeposit: number | null;
}

const CONDITIONAL_BALANCE_INFO =
    "These funds reside within outputs with additional unlock conditions which might be potentially un-lockable";

const AddressBalance: React.FC<AddressBalanceProps> = ({ totalBalance, availableBalance, storageDeposit }) => {
    const { tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [formatBalanceFull, setFormatBalanceFull] = useState(false);
    const [formatConditionalBalanceFull, setFormatConditionalBalanceFull] = useState(false);
    const [formatStorageBalanceFull, setFormatStorageBalanceFull] = useState(false);

    const buildBalanceView = (
        label: string,
        isFormatFull: boolean,
        setIsFormatFull: React.Dispatch<React.SetStateAction<boolean>>,
        showInfo: boolean,
        showWallet: boolean,
        amount: number | null,
    ) => (
        <div className="balance">
            {showWallet && <Icon icon="wallet" boxed />}
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

    const conditionalBalance = availableBalance === null ? undefined : totalBalance - availableBalance;
    const shouldShowExtendedBalance = conditionalBalance !== undefined && availableBalance !== undefined;

    return (
        <div className="row middle balance-wrapper">
            <div className="balance-wrapper--inner">
                {buildBalanceView(
                    "Available Balance",
                    formatBalanceFull,
                    setFormatBalanceFull,
                    false,
                    true,
                    shouldShowExtendedBalance ? availableBalance : totalBalance,
                )}
                {shouldShowExtendedBalance &&
                    buildBalanceView(
                        "Conditionally Locked Balance",
                        formatConditionalBalanceFull,
                        setFormatConditionalBalanceFull,
                        true,
                        false,
                        conditionalBalance,
                    )}
                {buildBalanceView("Storage Deposit", formatStorageBalanceFull, setFormatStorageBalanceFull, false, false, storageDeposit)}
            </div>
        </div>
    );
};

export default AddressBalance;
