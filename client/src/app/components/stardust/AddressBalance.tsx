import React, { useContext, useState } from "react";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
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
}

const AddressBalance: React.FC<AddressBalanceProps> = ({ balance, spendableBalance }) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);
    const [formatBalanceFull, setFormatBalanceFull] = useState(false);
    const [formatConditionalBalanceFull, setFormatConditionalBalanceFull] = useState(false);
    // eslint-disable-next-line max-len
    const lockedReason = "These funds reside within outputs with additional unlock conditions which might be potentially un-lockable";

    const buildBalanceView = (
        label: string,
        amount: number,
        isFormatFull: boolean,
        showInfo: boolean,
        setIsFormatFull: React.Dispatch<React.SetStateAction<boolean>>
    ) => (
        <div className="balance">
            <div className="row middle">
                <div className="label">{label}</div>
                {showInfo &&
                <Tooltip tooltipContent={lockedReason}>
                    <span className="material-icons">
                        info
                    </span>
                </Tooltip>}
            </div>
            <div className="value featured">
                {amount > 0 ? (
                    <div>
                        <div className="row middle">
                            <span
                                onClick={() => setIsFormatFull(!isFormatFull)}
                                className="pointer margin-r-5"
                            >
                                {formatAmount(amount, tokenInfo, isFormatFull)}
                            </span>
                            <CopyButton
                                onClick={() => ClipboardHelper.copy(String(amount))}
                                buttonType="copy"
                                labelPosition="bottom"
                            />
                        </div>
                        {isMarketed && (
                            <React.Fragment>
                                <span>(</span>
                                <FiatValue value={amount} />
                                <span>)</span>
                            </React.Fragment>
                        )}
                    </div>
                ) : 0}
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
            <Icon icon="wallet" boxed />
            <div className="balance-wrapper--inner">
                {shouldShowExtendedBalance ? (
                    <React.Fragment>
                        {buildBalanceView(
                            "Spendable Balance",
                            spendableBalance,
                            formatBalanceFull,
                            false,
                            setFormatBalanceFull
                        )}
                        {buildBalanceView(
                            "Conditionally Locked Balance",
                            conditionalBalance,
                            formatConditionalBalanceFull,
                            true,
                            setFormatConditionalBalanceFull
                        )}
                    </React.Fragment>
                ) : (
                    buildBalanceView(
                        "Balance",
                        balance,
                        formatBalanceFull,
                        false,
                        setFormatBalanceFull
                    )
                )}
            </div>
        </div>
    );
};

AddressBalance.defaultProps = { spendableBalance: undefined };

export default AddressBalance;
