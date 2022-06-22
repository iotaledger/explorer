/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React, { useEffect, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAssociatedOutput } from "../../../models/api/stardust/IAssociatedOutputsResponse";
import { STARDUST } from "../../../models/db/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Pagination from "../../components/Pagination";
import AssociatedOutput from "./AssociatedOutput";
import "./AssociatedOutputsTable.scss";

interface AssociatedOutputsTableProps {
    /**
     * The network in context.
     */
    network: string;
    /**
     * Bech32 address
     */
    address: string;
}

const PAGE_SIZE = 10;

/**
 * Component to render the Associated Outputs section.
 */
const AssociatedOutputsTable: React.FC<AssociatedOutputsTableProps> = ({ network, address }) => {
    const [associatedOutputs, setAssociatedOutputs] = useState<IAssociatedOutput[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<IAssociatedOutput[]>([]);
    const [outputDetailsLoaded, setOutputDetailsLoaded] = useState(false);

    // Fetch associated output ids
    useEffect(() => {
        const loadAssociatedOutputs = async () => {
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
            const associatedOutputsResponse = await tangleCacheService.associatedOutputs(network, address);

            if (associatedOutputsResponse?.outputs) {
                setAssociatedOutputs(associatedOutputsResponse.outputs);
            }
        };

        /* eslint-disable @typescript-eslint/no-floating-promises */
        loadAssociatedOutputs();
    }, [network, address]);

    // Fetch associated output details
    useEffect(() => {
        if (associatedOutputs) {
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

            for (const associatedOutput of associatedOutputs) {
                const outputId = associatedOutput.outputId;

                tangleCacheService.outputDetails(network, outputId).then(outputDetails => {
                    if (!associatedOutput.outputDetails) {
                        setAssociatedOutputs(
                            prevOutputs =>
                                prevOutputs.map(prevOutput => (
                                    associatedOutput.outputId === prevOutput.outputId &&
                                        associatedOutput.association === prevOutput.association ?
                                        { ...associatedOutput, outputDetails } :
                                        prevOutput
                            )
                                               ));
                    }
                })
                .finally(() => {
                    if (associatedOutputs.length > 0) {
                        setOutputDetailsLoaded(true);
                    }
                });
            }
        }
    }, [associatedOutputs]);

    // On page change handler
    useEffect(() => {
        if (outputDetailsLoaded) {
            const from = (pageNumber - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE;

            const page = associatedOutputs?.slice(from, to);
            setCurrentPage(page);
        }
    }, [associatedOutputs, pageNumber, outputDetailsLoaded]);

    return (
        outputDetailsLoaded ?
            <div className="section">
                <div className="section--header"><h2>Associated Outputs</h2></div>
                <table className="associated--table">
                    <thead>
                        <tr>
                            <th>Output type</th>
                            <th>Address found in</th>
                            <th>Date created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPage.map((associatedOutput, idx) => (
                            <AssociatedOutput
                                key={`${associatedOutput.outputId}${associatedOutput.association}${idx}`}
                                network={network}
                                associatedOutput={associatedOutput}
                                isMobile={false}
                            />
                        ))}
                    </tbody>
                </table>

                {/* ----- Only visible on mobile ----- */}
                <div className="associated--cards">
                    {currentPage.map((associatedOutput, idx) => (
                        <AssociatedOutput
                            key={`${associatedOutput.outputId}${associatedOutput.association}${idx}`}
                            network={network}
                            associatedOutput={associatedOutput}
                            isMobile={true}
                        />
                    ))}
                </div>

                <Pagination
                    classNames="associated--pagination"
                    currentPage={pageNumber}
                    totalCount={associatedOutputs?.length ?? 0}
                    pageSize={PAGE_SIZE}
                    siblingsCount={1}
                    onPageChange={n => setPageNumber(n)}
                />
            </div> : null
    );
};

export default AssociatedOutputsTable;

