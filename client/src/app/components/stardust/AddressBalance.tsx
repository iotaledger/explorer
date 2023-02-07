import React, { useContext, useState } from "react";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import NetworkContext from "../../context/NetworkContext";
import Icon from "../Icon";
import Tooltip from "../Tooltip";
import "./AddressBalance.scss";

interface AddressBalanceProps {
    /**
     * Will either contain the balance computed from iota.js highlevel funcion addressBalance,
     * or the totalBalance amount if data from chronicle was available (representing trivial + conditional balance).
     */
    balance: number;
    /**
     * The trivially unlockable portion of the balance, fetched from chronicle.
     */
    spendableBalance?: number;
    /**
     * The storage rent balance.
     */
    storageRentBalance?: number;
}

const CONDITIONAL_BALANCE_INFO =
    "These funds reside within outputs with additional unlock conditions which might be potentially un-lockable";

const AddressBalance: React.FC<AddressBalanceProps> = ({ balance, spendableBalance, storageRentBalance }) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);
    const [formatBalanceFull, setFormatBalanceFull] = useState(false);
    const [formatConditionalBalanceFull, setFormatConditionalBalanceFull] = useState(false);
    const [formatStorageBalanceFull, setFormatStorageBalanceFull] = useState(false);

    const buildBalanceView = (
        label: string,
        amount: number,
        isFormatFull: boolean,
        setIsFormatFull: React.Dispatch<React.SetStateAction<boolean>>,
        showInfo: boolean,
        showWallet: boolean
    ) => (
        <div className="balance">
            {showWallet && <Icon icon="wallet" boxed />}
            <div>
                <div className="row middle balance-heading">
                    <div className="label">{label}</div>
                    {showInfo &&
                        <Tooltip tooltipContent={CONDITIONAL_BALANCE_INFO}>
                            <span className="material-icons">
                                info
                            </span>
                        </Tooltip>}
                </div>
                <div className="value featured">
                    {amount > 0 ? (
                        <div className="balance-value middle">
                            <div className="row middle">
                                <span
                                    onClick={() => setIsFormatFull(!isFormatFull)}
                                    className="balance-smr pointer margin-r-5"
                                >
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
                    ) : <span className="margin-r-5">0</span>}
                </div>
            </div>
        </div>
    );

    const isMarketed = isMarketedNetwork(network);
    const conditionalBalance = spendableBalance !== undefined ?
        balance - spendableBalance :
        undefined;
    const shouldShowExtendedBalance = conditionalBalance !== undefined && spendableBalance !== undefined;

    return (
        <div className="row middle balance-wrapper">
            <div className="balance-wrapper--inner">
                {shouldShowExtendedBalance ? (
                    <React.Fragment>
                        {buildBalanceView(
                            "Available Balance",
                            spendableBalance,
                            formatBalanceFull,
                            setFormatBalanceFull,
                            false,
                            true
                        )}
                        {buildBalanceView(
                            "Conditionally Locked Balance",
                            conditionalBalance,
                            formatConditionalBalanceFull,
                            setFormatConditionalBalanceFull,
                            true,
                            false
                        )}
                        {storageRentBalance &&
                            buildBalanceView(
                                "Storage Deposit",
                                storageRentBalance,
                                formatStorageBalanceFull,
                                setFormatStorageBalanceFull,
                                false,
                                false
                            )}
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        {buildBalanceView(
                            "Balance",
                            balance,
                            formatBalanceFull,
                            setFormatBalanceFull,
                            false,
                            true
                        )}
                        {storageRentBalance &&
                            buildBalanceView(
                                "Storage Deposit",
                                storageRentBalance,
                                formatStorageBalanceFull,
                                setFormatStorageBalanceFull,
                                false,
                                false
                            )}
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

AddressBalance.defaultProps = { spendableBalance: undefined, storageRentBalance: undefined };

export default AddressBalance;
