import { IOutputResponse } from "@iota/iota.js-stardust";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Output from "../../components/stardust/Output";
import OutputPageProps from "./OutputPageProps";
import "./OutputPage.scss";

const OutputPage: React.FC<RouteComponentProps<OutputPageProps>> = (
    { match: { params: { network, outputId } } }
) => {
    const [outputDetails, setOutputDetails] = useState<IOutputResponse | undefined>();

    useEffect(() => {
        const stardustTangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        stardustTangleCacheService.outputDetails(network, outputId).then(
            outputDetailsResponse => setOutputDetails(outputDetailsResponse)
        )
        .catch(() => {});
    }, []);

    const {
        blockId, transactionId, outputIndex, isSpent, milestoneIndexSpent, milestoneTimestampSpent,
        transactionIdSpent, milestoneIndexBooked, milestoneTimestampBooked
    } = outputDetails?.metadata ?? {};

    return (outputDetails &&
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
                    <div className="section">
                        <div className="card">
                            <Output
                                network={network}
                                outputId={outputId}
                                output={outputDetails.output}
                                amount={Number(outputDetails.output.amount)}
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
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {blockId}
                                    </span>
                                </div>
                            </div>
                        )}

                        {transactionId && (
                            <div className="section--data">
                                <div className="label">
                                    Transaction ID
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {transactionId}
                                    </span>
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

                        {milestoneIndexSpent && (
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

                        {milestoneTimestampSpent && (
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
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {transactionIdSpent}
                                    </span>
                                </div>
                            </div>
                        )}

                        {milestoneIndexBooked && (
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

                        {milestoneTimestampBooked && (
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

