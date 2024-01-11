import React from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import classNames from "classnames";
import {
    Output,
    OutputType,
    CommonOutput,
    AccountOutput,
    AnchorOutput,
    FoundryOutput,
    NftOutput,
} from "@iota/sdk-wasm-nova/web";
import UnlockConditionView from "./UnlockConditionView";
import CopyButton from "../CopyButton";
import { Link } from "react-router-dom";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import FeatureView from "./FeaturesView";
import "./OutputView.scss";

interface OutputViewProps {
    outputId: string;
    output: Output;
    showCopyAmount: boolean;
    isPreExpanded?: boolean;
    isLinksDisabled?: boolean;
}

const OutputView: React.FC<OutputViewProps> = ({
    outputId,
    output,
    showCopyAmount,
    isPreExpanded,
    isLinksDisabled,
}) => {
    const [isExpanded, setIsExpanded] = React.useState(isPreExpanded ?? false);
    const [isFormattedBalance, setIsFormattedBalance] = React.useState(true);
    const networkInfo = useNetworkInfoNova((s) => s.networkInfo);

    const outputIdTransactionPart = `${outputId.slice(
        0,
        8,
    )}....${outputId.slice(-8, -4)}`;
    const outputIdIndexPart = outputId.slice(-4);

    const header = (
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
                <div className="output-id--link">
                    (
                    {isLinksDisabled ? (
                        <div className="margin-r-t">
                            <span className="highlight">
                                {outputIdTransactionPart}
                            </span>
                            <span className="highlight">
                                {outputIdIndexPart}
                            </span>
                        </div>
                    ) : (
                        <Link
                            to={`/${networkInfo.name}/output/${outputId}`}
                            className="margin-r-t"
                        >
                            <span>{outputIdTransactionPart}</span>
                            <span className="highlight">
                                {outputIdIndexPart}
                            </span>
                        </Link>
                    )}
                    )
                    <CopyButton copy={String(outputId)} />
                </div>
            </div>
            {showCopyAmount && (
                <div className="card--value pointer amount-size row end">
                    <span
                        className="pointer"
                        onClick={(e) => {
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
    );

    return (
        <div className="card--content__output">
            {header}
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
                    {output.type !== OutputType.Delegation &&
                        (output as CommonOutput).features?.map(
                            (feature, idx) => (
                                <FeatureView
                                    key={idx}
                                    feature={feature}
                                    isPreExpanded={isPreExpanded}
                                    isImmutable={false}
                                />
                            ),
                        )}
                    {output.type === OutputType.Account &&
                        (output as AccountOutput).immutableFeatures?.map(
                            (immutableFeature, idx) => (
                                <FeatureView
                                    key={idx}
                                    feature={immutableFeature}
                                    isPreExpanded={isPreExpanded}
                                    isImmutable={true}
                                />
                            ),
                        )}
                    {output.type === OutputType.Anchor &&
                        (output as AnchorOutput).immutableFeatures?.map(
                            (immutableFeature, idx) => (
                                <FeatureView
                                    key={idx}
                                    feature={immutableFeature}
                                    isPreExpanded={isPreExpanded}
                                    isImmutable={true}
                                />
                            ),
                        )}
                    {output.type === OutputType.Nft &&
                        (output as NftOutput).immutableFeatures?.map(
                            (immutableFeature, idx) => (
                                <FeatureView
                                    key={idx}
                                    feature={immutableFeature}
                                    isPreExpanded={isPreExpanded}
                                    isImmutable={true}
                                />
                            ),
                        )}
                    {output.type === OutputType.Foundry &&
                        (output as FoundryOutput).immutableFeatures?.map(
                            (immutableFeature, idx) => (
                                <FeatureView
                                    key={idx}
                                    feature={immutableFeature}
                                    isPreExpanded={isPreExpanded}
                                    isImmutable={true}
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
