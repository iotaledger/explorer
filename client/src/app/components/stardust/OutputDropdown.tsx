import classNames from "classnames";
import React, { useState } from "react";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import CopyButton from "../CopyButton";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import Output from "./Output";
import { OutputDropdownProps } from "./OutputDropdownProps";

export const OutputDropdown: React.FC<OutputDropdownProps> = (
    { outputIndex, showOutputDetails, context, output, network }) => {
    const [showOutput, setShowOutput] = useState(showOutputDetails);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);

    return (
        <React.Fragment key={outputIndex}>
            <div
                className="card--content__input card--value"
                onClick={() => setShowOutput(
                    showOutput === outputIndex ? -1 : outputIndex
                )}
            >
                <div className={classNames(
                    "margin-r-t", "card--content__input--dropdown",
                    "card--content__flex_between",
                    { opened: showOutput === outputIndex }
                )}
                >
                    <DropdownIcon />
                </div>
                <button
                    type="button"
                    className="margin-r-t color"
                >
                    {NameHelper.getOutputTypeName(output.type)}
                </button>
                <div className="card--value pointer amount-size row end">
                    <span
                        className="margin-r-t"
                        onClick={e => {
                            setIsFormattedBalance(!isFormattedBalance);
                            e.stopPropagation();
                        }}
                    >
                        {
                            isFormattedBalance
                                ? formatAmount(output.amount, context.tokenInfo)
                                : output.amount
                        }
                    </span>
                </div>
                <CopyButton
                    onClick={e => {
                        ClipboardHelper.copy(String(output.amount));
                        if (e) {
                            e.stopPropagation();
                        }
                    }}
                    buttonType="copy"
                    labelPosition="bottom"
                />
            </div>

            {showOutput === outputIndex && (
                <div className="card--value">
                    <Output
                        key={outputIndex}
                        id={output.id}
                        index={outputIndex + 1}
                        output={output.output}
                        amount={output.amount}
                        network={network}
                    />
                </div>
            )}
        </React.Fragment>
    );
};

