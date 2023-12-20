import React from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import classNames from "classnames";
import { Output, OutputType, CommonOutput } from "@iota/sdk-wasm-nova/web";
import UnlockConditionView from "./UnlockConditionView";
import CopyButton from "../CopyButton";
import "./OutputView.scss";

interface OutputViewProps {
    output: Output;
    showCopyAmount: boolean;
}

const OutputView: React.FC<OutputViewProps> = ({ output, showCopyAmount }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isFormattedBalance, setIsFormattedBalance] = React.useState(true);

    console.log(output);

    return (
        <div className="card--content__output">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="card--value card-header--wrapper"
            >
                <div
                    className={classNames("card--content--dropdown", {
                        opened: isExpanded,
                    })}
                >
                    <DropdownIcon />
                </div>
                <div className="output-header">
                    <button type="button" className="output-type--name color">
                        {getOutputTypeName(output.type)}
                    </button>
                </div>
                {showCopyAmount && (
                    <div className="card--value pointer amount-size row end">
                        <span
                            className="pointer"
                            onClick={e => {
                                setIsFormattedBalance(!isFormattedBalance);
                                e.stopPropagation();
                            }}
                        >
                            {output.amount}
                        </span>
                    </div>
                )}
                {showCopyAmount && <CopyButton copy={output.amount} />}
            </div>
            {isExpanded && (
                <div className="output padding-l-t left-border">
                    {(output as CommonOutput).unlockConditions?.map(
                        (unlockCondition, idx) => (
                            <UnlockConditionView
                                key={idx}
                                unlockCondition={unlockCondition}
                                isPreExpanded={true}
                            />
                        ),
                    )}
                </div>
            )}
        </div>
    );
};

function getOutputTypeName(type: OutputType): string {
    switch (type) {
        case OutputType.Basic:
            return "Basic";
        case OutputType.Account:
            return "Account";
        case OutputType.Anchor:
            return "Anchor";
        case OutputType.Foundry:
            return "Foundry";
        case OutputType.Nft:
            return "Nft";
        case OutputType.Delegation:
            return "Delegation";
    }
}

export default OutputView;