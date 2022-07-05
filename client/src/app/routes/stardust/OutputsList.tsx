/* eslint-disable @typescript-eslint/no-floating-promises */
import { IOutputResponse } from "@iota/iota.js-stardust";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Output from "../../components/stardust/Output";
import "./OutputsList.scss";
import OutputsListProps from "./OutputsListProps";

const OutputsList: React.FC<RouteComponentProps<OutputsListProps>> = (
    { match: { params: { network, tag } }, location: { state } }
) => {
    const [outputsDetail, setOutputsDetail] = useState<IOutputResponse[] | undefined>();
    const [outputIds, setOutputIds] = useState<string[]>();


    useEffect(() => {
        if (state) {
            // Typecast from unknown to array of strings
            const ids: string[] = state as string[];
            setOutputIds(ids);
        }
    }, []);

    useEffect(() => {
        if (outputIds && outputIds.length > 0) {
            getOutputDetails(outputIds);
        }
    }, [outputIds]);

    const getOutputDetails = async (ids: string[]) => {
        const stardustTangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
        const outputs: IOutputResponse[] = [];

        for (const outputId of ids) {
                const outputResponse = await stardustTangleCacheService.outputDetails(network, outputId);
                if (outputResponse) {
                    outputs.push(outputResponse);
                }
        }
        setOutputsDetail(outputs);
    };

    return (
        <div className="output-list">
            <div className="wrapper">
                <div className="inner">
                    <div className="output-list--header">
                        <div className="row middle">
                            <h1>
                                Outputs &quot;{tag}&#34;
                            </h1>
                        </div>
                    </div>
                    {outputIds && outputsDetail && outputsDetail.length > 0 &&
                        <div className="section">
                            {outputsDetail.map((output, index) => (
                                <div key={index}>
                                    <div className="card">
                                        <Output
                                            network={network}
                                            outputId={outputIds[index]}
                                            output={output.output}
                                            amount={Number(output.output.amount)}
                                            showCopyAmount={true}
                                            isPreExpanded={true}
                                        />
                                    </div>

                                    <div className="section--header row row--tablet-responsive middle space-between">
                                        <div className="row middle">
                                            <h2>Metadata</h2>
                                        </div>
                                    </div>

                                    {output.metadata.blockId && (
                                        <div className="section--data">
                                            <div className="label">
                                                Block ID
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {output.metadata.blockId}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {output.metadata.transactionId && (
                                        <div className="section--data">
                                            <div className="label">
                                                Transaction ID
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {output.metadata.transactionId}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {output.metadata.outputIndex !== undefined && (
                                        <div className="section--data">
                                            <div className="label">
                                                Output index
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {output.metadata.outputIndex}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {output.metadata.isSpent !== undefined && (
                                        <div className="section--data">
                                            <div className="label">
                                                Is spent ?
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {output.metadata.isSpent.toString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {output.metadata.milestoneIndexSpent && (
                                        <div className="section--data">
                                            <div className="label">
                                                Spent at milestone
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {output.metadata.milestoneIndexSpent}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {output.metadata.milestoneTimestampSpent && (
                                        <div className="section--data">
                                            <div className="label">
                                                Spent at milestone timestamp
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {
                                                        DateHelper.formatShort(
                                                            output.metadata.milestoneTimestampSpent * 1000
                                                        )
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {output.metadata.transactionIdSpent && (
                                        <div className="section--data">
                                            <div className="label">
                                                Spent in transaction with ID
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {output.metadata.transactionIdSpent}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {output.metadata.milestoneIndexBooked && (
                                        <div className="section--data">
                                            <div className="label">
                                                Booked at milestone
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {output.metadata.milestoneIndexBooked}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {output.metadata.milestoneTimestampBooked && (
                                        <div className="section--data">
                                            <div className="label">
                                                Booked on
                                            </div>
                                            <div className="value code row middle">
                                                <span className="margin-r-t">
                                                    {
                                                        DateHelper.formatShort(
                                                            output.metadata.milestoneTimestampBooked * 1000
                                                        )
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>}
                </div>
            </div>
        </div>
    );
};


export default OutputsList;
