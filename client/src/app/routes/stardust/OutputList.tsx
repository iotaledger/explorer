/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react/no-unescaped-entities */
import { IOutputResponse } from "@iota/iota.js-stardust";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import Output from "../../components/stardust/Output";
import "./OutputList.scss";
import OutputListProps from "./OutputListProps";

interface OutputListLocationProps {
    outputIds: string[];
    tag: string;
}

interface OutputListItem {
    outputDetails: IOutputResponse;
    outputId: string;
}

const TOKEN_PAGE_SIZE: number = 5;

const OutputList: React.FC<RouteComponentProps<OutputListProps>> = (
    { match: { params: { network } } }
) => {
    const [outputDetails, setOutputDetails] = useState<OutputListItem[]>([]);
    const { outputIds, tag } = useLocation<OutputListLocationProps>().state ?? {
        outputIds: [],
        tag: ""
    };
    const [currentPage, setCurrentPage] = useState<OutputListItem[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOutputDetails();
    }, []);

    useEffect(() => {
        const from = (pageNumber - 1) * TOKEN_PAGE_SIZE;
        const to = from + TOKEN_PAGE_SIZE;
        setCurrentPage(outputDetails.slice(from, to));
    }, [outputDetails, pageNumber]);

    const fetchOutputDetails = async () => {
        if (outputIds.length > 0) {
            // eslint-disable-next-line max-len
            const stardustTangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
            const outputs: OutputListItem[] = [];

            for (const outputId of outputIds) {
                const outputResponse = await stardustTangleCacheService.outputDetails(network, outputId);
                if (!outputResponse.error && outputResponse.output && outputResponse.metadata) {
                    const fetchedOutputDetails = {
                        output: outputResponse.output,
                        metadata: outputResponse.metadata
                    };

                    const item: OutputListItem = {
                        outputDetails: fetchedOutputDetails,
                        outputId
                    };

                    outputs.push(item);
                }
            }
            setOutputDetails(outputs);
        }
        setIsLoading(false);
    };

    return outputDetails && outputDetails.length > 0 ?
        <div className="output-list">
            <div className="wrapper">
                <div className="inner">
                    <div className="output-list--header">
                        <div className="row middle">
                            <h1>
                                Outputs with tag "{tag}"
                            </h1>
                        </div>
                    </div>
                    {currentPage.length > 0 &&
                        <div className="section margin-b-s">
                            {currentPage.map((item, index) => (
                                <div key={index} className="card margin-b-s">
                                    <Output
                                        network={network}
                                        outputId={item.outputId}
                                        output={item.outputDetails.output}
                                        amount={Number(item.outputDetails.output.amount)}
                                        showCopyAmount={true}
                                        isPreExpanded={false}
                                    />
                                </div>
                            ))}
                        </div>}
                    <Pagination
                        currentPage={pageNumber}
                        totalCount={outputDetails.length}
                        pageSize={TOKEN_PAGE_SIZE}
                        siblingsCount={1}
                        onPageChange={number => setPageNumber(number)}
                    />
                </div>
            </div>
        </div> :
        <div className="content row center card">
            {isLoading ?
                <Spinner /> :
                <h2>No data available</h2>}
        </div>;
};


export default OutputList;
