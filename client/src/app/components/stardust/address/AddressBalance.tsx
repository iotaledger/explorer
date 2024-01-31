import React, { useContext, useState } from "react";
import { isMarketedNetwork } from "~helpers/networkHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "../../../context/NetworkContext";
import CopyButton from "../../CopyButton";
import FiatValue from "../../FiatValue";
import Icon from "../../Icon";
import Tooltip from "../../Tooltip";
import "./AddressBalance.scss";

interface AddressBalanceProps {
    /**
     * Will either contain the balance computed from iota.js highlevel funcion addressBalance,
     * or the totalBalance amount if data from chronicle was available (representing trivial + conditional balance).
     */
    readonly balance: number;
    /**
     * The trivially unlockable portion of the balance, fetched from chronicle.
     */
    readonly spendableBalance: number | null;
    /**
     * The storage rent balance.
     */
    readonly storageDeposit: number | null;
}

const CONDITIONAL_BALANCE_INFO =
    "These funds reside within outputs with additional unlock conditions which might be potentially un-lockable";

const AddressBalance: React.FC<AddressBalanceProps> = ({ balance, spendableBalance, storageDeposit }) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);
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
                                <span onClick={() => setIsFormatFull(!isFormatFull)} className="balance-smr pointer margin-r-5">
                                    {formatAmount(amount, tokenInfo, isFormatFull)}
                                </span>
                                <CopyButton copy={String(amount)} />
                            </div>
                            {isMarketed && (
                                <div className="balance-value--inline">
                                    <span>(</span>
                                    <FiatValue classNames="balance-fiat" value={amount} />
                                    <span>)</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="margin-r-5">0</span>
                    )}
                </div>
            </div>
        </div>
    );

    const isMarketed = isMarketedNetwork(network);
    const conditionalBalance = spendableBalance === null ? undefined : balance - spendableBalance;
    const shouldShowExtendedBalance = conditionalBalance !== undefined && spendableBalance !== undefined;

    return (
        <div className="row middle balance-wrapper">
            <div className="balance-wrapper--inner">
                {buildBalanceView(
                    "Available Balance",
                    formatBalanceFull,
                    setFormatBalanceFull,
                    false,
                    true,
                    shouldShowExtendedBalance ? spendableBalance : balance,
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
