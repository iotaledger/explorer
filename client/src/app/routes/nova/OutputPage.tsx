import React from "react";
import mainMessage from "~assets/modals/stardust/output/main-header.json";
import { Link, RouteComponentProps } from "react-router-dom";
import Modal from "~/app/components/Modal";
import NotFound from "~/app/components/NotFound";
import OutputView from "~/app/components/nova/OutputView";
import { useOutputDetails } from "~/helpers/nova/hooks/useOutputDetails";
import CopyButton from "~/app/components/CopyButton";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import "./OutputPage.scss";

interface OutputPageProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The output id to lookup.
     */
    outputId: string;
}

const OutputPage: React.FC<RouteComponentProps<OutputPageProps>> = ({
    match: {
        params: { network, outputId },
    },
}) => {
    const { output, outputMetadataResponse, error } = useOutputDetails(network, outputId);

    if (error) {
        return (
            <div className="output-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="output-page--header">
                            <div className="row middle">
                                <h1>Output</h1>
                            </div>
                        </div>
                        <NotFound searchTarget="output" query={outputId} />
                    </div>
                </div>
            </div>
        );
    }

    const { blockId, transactionId, outputIndex, isSpent, transactionIdSpent } = outputMetadataResponse ?? {};

    return (
        (output && (
            <div className="output-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="output-page--header">
                            <div className="row middle">
                                <h1>Output</h1>
                                <Modal icon="info" data={mainMessage} />
                            </div>
                        </div>
                        <div className="section">
                            <div className="card">
                                <OutputView network={network} outputId={outputId} output={output} showCopyAmount={true} isPreExpanded={true} />
                            </div>

                            <div className="section--header row row--tablet-responsive middle space-between">
                                <div className="row middle">
                                    <h2>Metadata</h2>
                                </div>
                            </div>

                            {blockId && (
                                <div className="section--data">
                                    <div className="label">Block ID</div>
                                    <div className="value code row middle highlight">
                                        <Link to={`/${network}/block/${blockId}`} className="margin-r-t text--no-decoration truncate">
                                            {blockId}
                                        </Link>
                                        <CopyButton copy={blockId} />
                                    </div>
                                </div>
                            )}

                            {transactionId && (
                                <div className="section--data">
                                    <div className="label">Transaction ID</div>
                                    <div className="value code highlight row middle">
                                        <TruncatedId id={transactionId} showCopyButton />
                                    </div>
                                </div>
                            )}

                            {outputIndex !== undefined && (
                                <div className="section--data">
                                    <div className="label">Output index</div>
                                    <div className="value code row middle">
                                        <span className="margin-r-t">{outputIndex}</span>
                                    </div>
                                </div>
                            )}

                            {isSpent !== undefined && (
                                <div className="section--data">
                                    <div className="label">Is spent ?</div>
                                    <div className="value code row middle">
                                        <span className="margin-r-t">{isSpent.toString()}</span>
                                    </div>
                                </div>
                            )}

                            {transactionIdSpent && (
                                <div className="section--data">
                                    <div className="label">Spent in transaction with ID</div>
                                    <div className="value code row middle highlight">
                                        <Link to={`/${network}/transaction/${transactionIdSpent}`} className="margin-r-t">
                                            {transactionIdSpent}
                                        </Link>
                                        <CopyButton copy={transactionIdSpent} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )) ??
        null
    );
};

export default OutputPage;
