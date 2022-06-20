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
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [outputDetailsLoaded, setOutputDetailsLoaded] = useState(false);

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
                        {associatedOutputs.map((associatedOutput, idx) => (
                            <AssociatedOutput
                                key={idx}
                                network={network}
                                associatedOutput={associatedOutput}
                                isMobile={false}
                            />
                        ))}
                    </tbody>
                </table>

                {/* ----- Only visible on mobile ----- */}
                <div className="associated--cards">
                    {associatedOutputs.map((associatedOutput, idx) => (
                        <AssociatedOutput
                            key={idx}
                            network={network}
                            associatedOutput={associatedOutput}
                            isMobile={true}
                        />
                    ))}
                </div>

                <Pagination
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

