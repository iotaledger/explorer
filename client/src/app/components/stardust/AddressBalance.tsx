import React, { useContext, useState } from "react";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import NetworkContext from "../../context/NetworkContext";
import Icon from "../Icon";
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

    const buildBalanceView = (
        label: string,
        amount: number,
        isFormatFull: boolean,
        setIsFormatFull: React.Dispatch<React.SetStateAction<boolean>>
    ) => (
        <div className="balance">
            <div className="label">{label}</div>
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
                            setFormatBalanceFull
                        )}
                        {buildBalanceView(
                            "Conditionally Locked Balance",
                            conditionalBalance,
                            formatConditionalBalanceFull,
                            setFormatConditionalBalanceFull
                        )}
                    </React.Fragment>
                ) : (
                    buildBalanceView(
                        "Balance",
                        balance,
                        formatBalanceFull,
                        setFormatBalanceFull
                    )
                )}
            </div>
        </div>
    );
};

AddressBalance.defaultProps = { spendableBalance: undefined };

export default AddressBalance;
