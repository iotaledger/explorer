/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import { IUTXOInput } from "@iota/iota.js-stardust";
import classNames from "classnames";
import * as H from "history";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as DropdownIcon } from "../../../assets/dropdown-arrow.svg";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { IInput } from "../../../models/api/stardust/IInput";
import NetworkContext from "../../context/NetworkContext";
import Bech32Address from "./Bech32Address";

interface InputProps {
    /**
     * The inputs.
     */
    input: IUTXOInput & IInput;
    /**
     * The network in context.
     */
    network: string;
    /**
     * The history for navigation.
     */
    history: H.History;
}

/**
 * Component which will display an Input on stardust.
 */
const Input: React.FC<InputProps> = ({ input, network, history }) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <React.Fragment>
            <div
                className="card--content__input"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={classNames(
                    "margin-r-t", "card--content__input--dropdown",
                    { opened: isExpanded })}
                >
                    <DropdownIcon />
                </div>
                <Bech32Address
                    network={network}
                    history={history}
                    addressDetails={input.transactionAddress}
                    advancedMode={false}
                    hideLabel
                    truncateAddress={false}
                    showCopyButton={false}
                    labelPosition="bottom"
                />
                <div className="card--value amount-size">
                    {formatAmount(input.amount, tokenInfo)}
                </div>
            </div>

            {isExpanded && (
                <React.Fragment>
                    <div className="card--label"> Address</div>
                    <div className="card--value">
                        <Bech32Address
                            network={network}
                            history={history}
                            addressDetails={input.transactionAddress}
                            advancedMode
                            hideLabel
                            truncateAddress={false}
                            showCopyButton={true}
                            labelPosition="bottom"
                        />
                    </div>
                    <div className="card--label"> Transaction Id</div>
                    <div className="card--value">
                        <Link to={input.transactionUrl} className="margin-r-t" >
                            {input.transactionId}
                        </Link>
                    </div>
                    <div className="card--label"> Transaction Output Index</div>
                    <div className="card--value">{input.transactionOutputIndex}</div>
                    <div className="card--label"> Signature</div>
                    <div className="card--value">{input.signature}</div>
                    <div className="card--label"> Public Key</div>
                    <div className="card--value">{input.publicKey}</div>
                </React.Fragment>)}
        </React.Fragment>
    );
};

export default Input;
