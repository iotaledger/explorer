/* eslint-disable @typescript-eslint/no-floating-promises */
import { IOutputResponse } from "@iota/iota.js-stardust";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import Output from "../../components/stardust/Output";
import "./OutputsList.scss";
import OutputsListProps from "./OutputsListProps";

interface OutputsListState {
    outputIds: string[];
    tag: string;
}

interface OutputsListResponse {
    output: IOutputResponse;
    outputId: string;
}

const TOKEN_PAGE_SIZE: number = 5;

const OutputsList: React.FC<RouteComponentProps<OutputsListProps>> = (
    { match: { params: { network } } }
) => {
    const [outputsDetail, setOutputsDetail] = useState<OutputsListResponse[] | undefined>();
    const { state } = useLocation<OutputsListState>();
    const [currentPage, setCurrentPage] = useState<OutputsListResponse[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { outputIds, tag } = state ?? {
        outputIds: [],
        tag: ""
    };

    useEffect(() => {
        if (outputIds.length > 0) {
            getOutputDetails(outputIds);
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const from = (pageNumber - 1) * TOKEN_PAGE_SIZE;
        const to = from + TOKEN_PAGE_SIZE;
        if (outputsDetail) {
            setCurrentPage(outputsDetail.slice(from, to));
        }
    }, [outputsDetail, pageNumber]);

    const getOutputDetails = async (ids: string[]) => {
        const stardustTangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
        const outputs: OutputsListResponse[] = [];

        for (const outputId of ids) {
            const outputResponse = await stardustTangleCacheService.outputDetails(network, outputId);
            if (outputResponse) {
                const response = {
                    output: outputResponse,
                    outputId
                };
                outputs.push(response);
            }
        }
        setOutputsDetail(outputs);
        setIsLoading(false);
    };

    return outputsDetail ?
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
                    {currentPage.length > 0 &&
                        <div className="section margin-b-s">
                            {currentPage.map((data, index) => (
                                <div key={index} className="card margin-b-s">
                                    <Output
                                        network={network}
                                        outputId={data.outputId}
                                        output={data.output.output}
                                        amount={Number(data.output.output.amount)}
                                        showCopyAmount={true}
                                        isPreExpanded={false}
                                    />
                                </div>
                            ))}
                        </div>}
                    <Pagination
                        currentPage={pageNumber}
                        totalCount={outputsDetail?.length ?? 0}
                        pageSize={TOKEN_PAGE_SIZE}
                        siblingsCount={1}
                        onPageChange={number => setPageNumber(number)}
                    />
                </div>
            </div>
        </div> :
        <div className="content inner row middle center card">
            {isLoading ?
                <Spinner /> :
                <h2>No data available</h2>}
        </div>;
};


export default OutputsList;
