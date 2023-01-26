import { ISigLockedSingleOutput } from "@iota/iota.js";
import {
    ConfirmationState,
    IAliasOutput,
    IExtendedLockedOutput,
    ISigLockedColoredOutput,
    OutputTypeName
} from "@iota/protonet.js";
import classNames from "classnames";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as DropdownIcon } from "../../../assets/dropdown-arrow.svg";
import { getIOTABalance } from "../../../helpers/proto/outputHelper";
import { calcBalance } from "../../../helpers/proto/useAddress";
import { useOutput, useOutputMetadata } from "../../../helpers/proto/useOutput";
import CopyButton from "../CopyButton";
import DataToggle from "../DataToggle";
import "./TransactionPayload.scss";
import Balances from "./Balances";

interface OutputProps {
    outputId: string;
    network: string;
    isPreExpanded: boolean;
}

const Output: React.FC<OutputProps> = (
    { outputId, network, isPreExpanded }
) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [output, isOutputLoading] = useOutput(network, outputId);
    const [outputMeta, isOutputMetaLoading] = useOutputMetadata(network, outputId);

    useEffect(() => {
        if (isPreExpanded && !isExpanded) {
            setIsExpanded(true);
        }
    }, []);

    if (isOutputLoading || !output || !outputMeta || isOutputMetaLoading) {
        return <div />;
    }

    const outputHeader = (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="card--value card-header--wrapper"
        >
            <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                <DropdownIcon />
            </div>
            <div className="output-header">
                <button
                    type="button"
                    className="output-type--name margin-r-t color"
                >
                    {output?.type}
                </button>
                <div className="output-id--link">
                    <div className="margin-r-t">
                        <span className="highlight">{output.outputID.base58.slice(0, 8)}</span>
                    </div>
                    <CopyButton copy={String(outputId)} />
                </div>
            </div>
            <div className="card--value pointer amount-size row end">
                {getIOTABalance(output.type, output.output)}
            </div>
        </div>
    );

    const metadataNodes = (
        <>
            <div className="card--label">Confirmation State:</div>
            <div className="card--value row middle">
                {ConfirmationState[outputMeta?.confirmationState ?? 0]}
            </div>
            <div className="card--label">Timestamp:</div>
            <div className="card--value row middle">
                {moment((outputMeta?.confirmationStateTime ?? 0) * 1000).format()}
            </div>
            <div className="card--label">Conflict IDs:</div>
            <div className="card--value row middle">
                {outputMeta?.conflictIDs.length > 0 ? outputMeta?.conflictIDs.join(", ") : "None"}
            </div>
        </>
    );

    let outputRender: React.ReactNode;
    if (output?.type === OutputTypeName.SigLockedSingleOutputType) {
        const sigLockedOutput = output?.output as unknown as ISigLockedSingleOutput;
        outputRender = (
            <div className="card--content__output">
                {outputHeader}
                {isExpanded && (
                    <div className="output margin-l-t">
                        <div className="card--label">Output ID:</div>
                        <div className="card--value row middle">
                            <Link to={`/${network}/output/${output?.outputID.base58}`} className="margin-r-t">
                                {output?.outputID.base58}
                            </Link>
                            <CopyButton copy={output?.outputID.base58} />
                        </div>
                        <div className="card--label">Address:</div>
                        <div className="card--value row middle">
                            <Link to={`/${network}/address/${sigLockedOutput.address.address}`} className="margin-r-t">
                                {sigLockedOutput.address.address}
                            </Link>
                            <CopyButton copy={sigLockedOutput.address.address} />
                        </div>
                        <div className="card--label">Balances:</div>
                        <div className="card--value row middle">
                            <Balances asList={true} balances={calcBalance([output])} />
                        </div>
                        {metadataNodes}
                    </div>
                )}
            </div>
        );
    }

    if (output?.type === OutputTypeName.SigLockedColoredOutputType) {
        const sigLockedColoredOutput = output?.output as unknown as ISigLockedColoredOutput;
        outputRender = (
            <div className="card--content__output">
                {outputHeader}
                {isExpanded && (
                    <div className="output margin-l-t">
                        <div className="card--label">Output ID:</div>
                        <div className="card--value row middle">
                            <Link to={`/${network}/output/${output?.outputID.base58}`} className="margin-r-t">
                                {output?.outputID.base58}
                            </Link>
                            <CopyButton copy={output?.outputID.base58} />
                        </div>
                        <div className="card--label">Address:</div>
                        <div className="card--value row middle">
                            <Link to={`/${network}/address/${sigLockedColoredOutput.address}`} className="margin-r-t">
                                {sigLockedColoredOutput.address}
                            </Link>
                            <CopyButton copy={sigLockedColoredOutput.address} />
                        </div>
                        <div className="card--label">Balances:</div>
                        <div className="card--value row middle">
                            <Balances asList={true} balances={calcBalance([output])} />
                        </div>
                        {metadataNodes}
                    </div>
                )}
            </div>
        );
    }

    if (output?.type === OutputTypeName.ExtendedLockedOutputType) {
        const extendedOutput = output?.output as unknown as IExtendedLockedOutput;
        outputRender = (
            <div className="card--content__output">
                {outputHeader}
                {isExpanded && (
                    <div className="output margin-l-t">
                        <div className="card--label">Output ID:</div>
                        <div className="card--value row middle">
                            <Link to={`/${network}/output/${output?.outputID.base58}`} className="margin-r-t">
                                {output?.outputID.base58}
                            </Link>
                            <CopyButton copy={output?.outputID.base58} />
                        </div>
                        <div className="card--label">Address:</div>
                        <div className="card--value row middle">
                            <Link to={`/${network}/address/${extendedOutput.address}`} className="margin-r-t">
                                {extendedOutput.address}
                            </Link>
                            <CopyButton copy={extendedOutput.address} />
                        </div>
                        <div className="card--label">Timelock:</div>
                        <div className="card--value row middle">
                            {extendedOutput.timelock ?
                                <span>moment(extendedOutput.timelock ?? 0)</span>
                                : "-"}
                        </div>
                        <div className="card--label">Fallback Address:</div>
                        <div className="card--value row middle">
                            {extendedOutput.fallbackAddress}
                        </div>
                        <div className="card--label">Fallback Deadline:</div>
                        <div className="card--value row middle">
                            {extendedOutput.fallbackDeadline ?
                                <span>moment(extendedOutput.fallbackDeadline ?? 0)</span>
                                : "-"}
                        </div>
                        <div className="card--label">Balances:</div>
                        <div className="card--value row middle">
                            <Balances asList={true} balances={calcBalance([output])} />
                        </div>
                        {metadataNodes}
                    </div>
                )}
            </div>
        );
    }

    if (output?.type === OutputTypeName.AliasOutputType) {
        const aliasOutput = output?.output as unknown as IAliasOutput;
        outputRender = (
            <div className="card--content__output">
                {outputHeader}
                {isExpanded && (
                    <div className="output margin-l-t">
                        <div className="card--label">Alias address:</div>
                        <div className="card--value row middle">
                            <Link to={`/${network}/address/${aliasOutput.aliasAddress}`} className="margin-r-t">
                                {output.outputID.base58}
                            </Link>
                            <CopyButton copy={output.outputID.base58} />
                        </div>
                        <div className="card--label">Balances:</div>
                        <div className="card--value row middle">
                            <Balances asList={true} balances={calcBalance([output])} />
                        </div>
                        <div className="card--label">State index:</div>
                        <div className="card--value row">{(output?.output as IAliasOutput).stateIndex}</div>
                        {(output?.output as IAliasOutput).stateData && (
                            <React.Fragment>
                                <div className="card--label">State metadata:</div>
                                <div className="card--value row">
                                    <DataToggle
                                        sourceData={(output?.output as IAliasOutput).stateData?.toString() ?? ""}
                                        withSpacedHex={true}
                                    />
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                )}
            </div>
        );
    }


    return (
        <div className="card--content__output">
            {outputRender}
        </div>
    );
};

export default Output;
