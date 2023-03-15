/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { IOutputDetails, useOutputsDetails } from "../../../helpers/hooks/useOutputsDetails";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import Output from "../../components/stardust/Output";
import "./OutputList.scss";
import OutputListProps from "./OutputListProps";

interface OutputListLocationProps {
    outputIds: string[];
    tag: string;
}

const TOKEN_PAGE_SIZE: number = 5;

const OutputList: React.FC<RouteComponentProps<OutputListProps>> = (
    { match: { params: { network } } }
) => {
    const { outputIds, tag } = useLocation<OutputListLocationProps>().state ?? {
        outputIds: [],
        tag: ""
    };
    const [outputDetails, isLoading] = useOutputsDetails(network, outputIds);
    const [currentPage, setCurrentPage] = useState<IOutputDetails[]>([]);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        const from = (pageNumber - 1) * TOKEN_PAGE_SIZE;
        const to = from + TOKEN_PAGE_SIZE;
        setCurrentPage(outputDetails.slice(from, to));
    }, [outputDetails, pageNumber]);

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
