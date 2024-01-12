/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import { Utils } from "@iota/sdk-wasm-nova/web";
import classNames from "classnames";
import React, { useContext, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import Bech32Address from "../stardust/address/Bech32Address";
import OutputView from "./OutputView";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { IInput } from "~models/api/nova/IInput";
import NetworkContext from "../../context/NetworkContext";

interface InputProps {
    /**
     * The inputs.
     */
    readonly input: IInput;
    /**
     * The network in context.
     */
    readonly network: string;
}

/**
 * Component which will display an Input on stardust.
 */
const Input: React.FC<InputProps> = ({ input, network }) => {
    const history = useHistory();
    const { tokenInfo } = useContext(NetworkContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);

    const fallbackInputView = (
        <React.Fragment>
            <div
                className="card--content__input"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={classNames("margin-r-t", "card--content__input--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div style={{ flexGrow: 1 }} className="card--value">
                    <button type="button">Output</button>
                </div>
                {input.amount && (
                    <span
                        onClick={e => {
                            setIsFormattedBalance(!isFormattedBalance);
                            e.stopPropagation();
                        }}
                        className="card--value amount-size pointer"
                    >
                        {formatAmount(input.amount, tokenInfo, !isFormattedBalance)}
                    </span>
                )}
            </div>

            {isExpanded && (
                <React.Fragment>
                    <div className="card--label"> Address</div>
                    <div className="card--value">
                        <Bech32Address
                            network={network}
                            history={history}
                            addressDetails={input.address}
                            advancedMode
                            hideLabel
                            truncateAddress={false}
                            labelPosition="bottom"
                        />
                    </div>
                    <div className="card--label"> Transaction Id</div>
                    <div className="card--value">
                        <Link to={`/${network}/transaction/${input.transactionId}`} className="margin-r-t" >
                            {input.transactionId}
                        </Link>
                    </div>
                    <div className="card--label"> Transaction Output Index</div>
                    <div className="card--value">{input.transactionInputIndex}</div>
                </React.Fragment>)}
        </React.Fragment>
    );

    const outputId = Utils.computeOutputId(
        input.transactionId, input.transactionInputIndex
    );

    return input.output ?
        <OutputView
            outputId={outputId}
            output={input.output.output}
            showCopyAmount={true}
        /> : fallbackInputView;
};

export default Input;
