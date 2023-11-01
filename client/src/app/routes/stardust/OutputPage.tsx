import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import OutputPageProps from "./OutputPageProps";
import mainMessage from "../../../assets/modals/stardust/output/main-header.json";
import { DateHelper } from "../../../helpers/dateHelper";
import { useOutputDetails } from "../../../helpers/hooks/useOutputDetails";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { formatSpecialBlockId } from "../../../helpers/stardust/valueFormatHelper";
import { CHRYSALIS_MAINNET } from "../../../models/config/networkType";
import CopyButton from "../../components/CopyButton";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Output from "../../components/stardust/Output";
import TruncatedId from "../../components/stardust/TruncatedId";
import Tooltip from "../../components/Tooltip";
import "./OutputPage.scss";

const OutputPage: React.FC<RouteComponentProps<OutputPageProps>> = (
    { match: { params: { network, outputId } } }
) => {
    const [output, outputMetadata, , outputError] = useOutputDetails(network, outputId);

    if (outputError) {
        return (
            <div className="output-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="output-page--header">
                            <div className="row middle">
                                <h1>
                                    Output
                                </h1>
                            </div>
                        </div>
                        <NotFound
                            searchTarget="output"
                            query={outputId}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const {
        blockId, transactionId, outputIndex, isSpent, milestoneIndexSpent, milestoneTimestampSpent,
        transactionIdSpent, milestoneIndexBooked, milestoneTimestampBooked
    } = outputMetadata ?? {};

    const isTransactionFromStardustGenesis = milestoneIndexBooked &&
        TransactionsHelper.isTransactionFromIotaStardustGenesis(network, milestoneIndexBooked);
    const transctionLink = isTransactionFromStardustGenesis ?
        `/${CHRYSALIS_MAINNET}/search/${transactionId}` :
        `/${network}/transaction/${transactionId}`;

    return (output &&
        <div className="output-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="output-page--header">
                        <div className="row middle">
                            <h1>
                                Output
                            </h1>
                            <Modal icon="info" data={mainMessage} />
                        </div>
                    </div>
                    <div className="section">
                        <div className="card">
                            <Output
                                network={network}
                                outputId={outputId}
                                output={output}
                                amount={Number(output.amount)}
                                showCopyAmount={true}
                                isPreExpanded={true}
                            />
                        </div>

                        <div className="section--header row row--tablet-responsive middle space-between">
                            <div className="row middle">
                                <h2>Metadata</h2>
                            </div>
                        </div>

                        {blockId && (
                            <div className="section--data">
                                <div className="label">
                                    Block ID
                                </div>
                                <div className="value code row middle highlight">
                                    <Link
                                        to={`/${network}/block/${blockId}`}
                                        className="margin-r-t text--no-decoration truncate"
                                    >
                                        {formatSpecialBlockId(blockId)}
                                    </Link>
                                    <CopyButton copy={blockId} />
                                </div>
                            </div>
                        )}

                        {transactionId && (
                            <div className="section--data">
                                <div className="label">
                                    Transaction ID
                                </div>
                                <div className="value code highlight row middle">
                                    {isTransactionFromStardustGenesis && (
                                        <Tooltip
                                            tooltipContent="This link opens the transaction on Chrysalis Mainnet"
                                            childrenClass="row middle"
                                        >
                                            <span className="material-icons">
                                                warning
                                            </span>
                                        </Tooltip>
                                    )}
                                    <TruncatedId
                                        id={transactionId}
                                        link={transctionLink}
                                        showCopyButton
                                    />
                                </div>
                            </div>
                        )}

                        {outputIndex !== undefined && (
                            <div className="section--data">
                                <div className="label">
                                    Output index
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {outputIndex}
                                    </span>
                                </div>
                            </div>
                        )}

                        {isSpent !== undefined && (
                            <div className="section--data">
                                <div className="label">
                                    Is spent ?
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {isSpent.toString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {milestoneIndexSpent !== undefined && (
                            <div className="section--data">
                                <div className="label">
                                    Spent at milestone
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {milestoneIndexSpent}
                                    </span>
                                </div>
                            </div>
                        )}

                        {milestoneTimestampSpent !== undefined && (
                            <div className="section--data">
                                <div className="label">
                                    Spent at milestone timestamp
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {DateHelper.formatShort(milestoneTimestampSpent * 1000)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {transactionIdSpent && (
                            <div className="section--data">
                                <div className="label">
                                    Spent in transaction with ID
                                </div>
                                <div className="value code row middle highlight">
                                    <Link
                                        to={`/${network}/transaction/${transactionIdSpent}`}
                                        className="margin-r-t"
                                    >
                                        {transactionIdSpent}
                                    </Link>
                                    <CopyButton copy={transactionIdSpent} />
                                </div>
                            </div>
                        )}

                        {milestoneIndexBooked !== undefined && (
                            <div className="section--data">
                                <div className="label">
                                    Booked at milestone
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {milestoneIndexBooked}
                                    </span>
                                </div>
                            </div>
                        )}

                        {milestoneTimestampBooked !== undefined && milestoneTimestampBooked !== 0 && (
                            <div className="section--data">
                                <div className="label">
                                    Booked on
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {DateHelper.formatShort(milestoneTimestampBooked * 1000)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>) ?? null;
};

export default OutputPage;

