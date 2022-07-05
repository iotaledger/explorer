/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { IAssociatedOutput } from "../../../models/api/stardust/IAssociatedOutputsResponse";
import { STARDUST } from "../../../models/config/protocolVersion";
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
     * Address details
     */
    addressDetails: IBech32AddressDetails;
}

const PAGE_SIZE = 10;

/**
 * Component to render the Associated Outputs section.
 */
const AssociatedOutputsTable: React.FC<AssociatedOutputsTableProps> = ({ network, addressDetails }) => {
    const [associatedOutputs, setAssociatedOutputs] = useState<IAssociatedOutput[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<IAssociatedOutput[]>([]);
    const [associatedOutputsLoaded, setAssociatedOutputsLoaded] = useState(false);
    const [outputDetailsLoaded, setOutputDetailsLoaded] = useState(false);

    // First fetch associated output ids
    useEffect(() => {
        const loadAssociatedOutputs = async () => {
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
            const associatedOutputsResponse = await tangleCacheService.associatedOutputs(network, addressDetails);

            if (associatedOutputsResponse?.outputs) {
                setAssociatedOutputs(associatedOutputsResponse.outputs);
                setAssociatedOutputsLoaded(true);
            }
        };

        /* eslint-disable @typescript-eslint/no-floating-promises */
        loadAssociatedOutputs();
    }, [network, addressDetails]);

    // Then fetch associated output details
    useEffect(() => {
        if (associatedOutputs.length > 0 && associatedOutputsLoaded) {
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

            const loadOutputDetails = async () => {
                const updatedAssociatedOutputs: IAssociatedOutput[] = [...associatedOutputs];
                const promises: Promise<void>[] = [];

                for (const [idx, associatedOutput] of updatedAssociatedOutputs.entries()) {
                    const outputId = associatedOutput.outputId;

                    const outputDetailsPromise = new Promise<void>((resolve, reject) => {
                        tangleCacheService.outputDetails(network, outputId).then(outputDetails => {
                            if (!outputDetails?.output) {
                                // eslint-disable-next-line prefer-promise-reject-errors
                                reject("Couldn't load all associated output details");
                            }

                            updatedAssociatedOutputs[idx] = { ...associatedOutput, outputDetails };
                            resolve();
                        }).catch(e => reject(e));
                    });

                    promises.push(outputDetailsPromise);
                }

                Promise.all(promises).then(() => {
                    updatedAssociatedOutputs.sort((a, b) => {
                        const timestampBookedA = a.outputDetails?.metadata.milestoneTimestampBooked;
                        const timestampBookedB = b.outputDetails?.metadata.milestoneTimestampBooked;
                        return moment(timestampBookedA).isAfter(moment(timestampBookedB)) ? -1 : 1;
                    });

                    setAssociatedOutputs(updatedAssociatedOutputs);
                    setOutputDetailsLoaded(true);
                }).catch(e => console.log(e));
            };

            loadOutputDetails();
        }
    }, [associatedOutputsLoaded]);

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

