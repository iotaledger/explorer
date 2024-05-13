/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import { Utils } from "@iota/sdk-wasm-stardust/web";
import classNames from "classnames";
import React, { useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { IInput } from "~models/api/stardust/IInput";
import { IPreExpandedConfig } from "~models/components";
import NetworkContext from "../../context/NetworkContext";
import Output from "./Output";
import Bech32Address from "./address/Bech32Address";

interface InputProps {
    /**
     * The inputs.
     */
    readonly input: IInput;
    /**
     * The network in context.
     */
    readonly network: string;
    /**
     * Should the input be pre-expanded.
     */
    readonly preExpandedConfig?: IPreExpandedConfig;
}

/**
 * Component which will display an Input on stardust.
 */
const Input: React.FC<InputProps> = ({ input, network, preExpandedConfig }) => {
    const history = useHistory();
    const { tokenInfo } = useContext(NetworkContext);
    const [isExpanded, setIsExpanded] = useState(preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.isPreExpanded ?? false);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);

    useEffect(() => {
        setIsExpanded(preExpandedConfig?.isAllPreExpanded ?? preExpandedConfig?.isPreExpanded ?? isExpanded ?? false);
    }, [preExpandedConfig]);

    const fallbackInputView = (
        <React.Fragment>
            <div className="card--content__input" onClick={() => setIsExpanded(!isExpanded)}>
                <div className={classNames("margin-r-t", "card--content__input--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div style={{ flexGrow: 1 }} className="card--value">
                    <button type="button">Output</button>
                </div>
                {input.amount && (
                    <span
                        onClick={(e) => {
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
                        <Link to={`/${network}/transaction/${input.transactionId}`} className="margin-r-t">
                            {input.transactionId}
                        </Link>
                    </div>
                    <div className="card--label"> Transaction Output Index</div>
                    <div className="card--value">{input.transactionInputIndex}</div>
                </React.Fragment>
            )}
        </React.Fragment>
    );

    const outputId = Utils.computeOutputId(input.transactionId, input.transactionInputIndex);

    return input.output ? (
        <Output
            outputId={outputId}
            output={input.output.output}
            amount={Number(input.output.output.amount)}
            network={network}
            showCopyAmount={true}
            preExpandedConfig={preExpandedConfig}
        />
    ) : (
        fallbackInputView
    );
};

export default Input;
