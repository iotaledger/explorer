import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { AsyncProps } from "../../../helpers/promise/AsyncProps";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
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
const OUTPUT_IDS_LIMIT = 100;

const AssociatedOutputsTable: React.FC<AssociatedOutputsTableProps & AsyncProps> = (
    { network, addressDetails, onAsyncStatusChange }
) => {
    const mounted = useRef(false);
    const [isExcessiveOutputsSize, setIsExcessiveOutputsSize] = useState(false);
    const [associatedOutputs, setAssociatedOutputs] = useState<IAssociatedOutput[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<IAssociatedOutput[]>([]);
    const [associatedOutputsLoaded, setAssociatedOutputsLoaded] = useState(false);
    const [outputDetailsLoaded, setOutputDetailsLoaded] = useState(false);

    const unmount = () => {
        mounted.current = false;
    };

    // First fetch associated output ids
    useEffect(() => {
        mounted.current = true;
        const loadAssociatedOutputs = async () => {
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
            const associatedOutputsResponse = await tangleCacheService.associatedOutputs(network, addressDetails);

            if (associatedOutputsResponse?.outputs && mounted.current) {
                if (associatedOutputsResponse.outputs.length <= OUTPUT_IDS_LIMIT) {
                    setAssociatedOutputs(associatedOutputsResponse.outputs);
                    setAssociatedOutputsLoaded(true);
                } else {
                    setIsExcessiveOutputsSize(true);
                }
            }
        };

        /* eslint-disable @typescript-eslint/no-floating-promises */
        loadAssociatedOutputs();
        return unmount;
    }, [network, addressDetails]);

    // Then fetch associated output details
    useEffect(() => {
        if (associatedOutputs.length > 0 && associatedOutputsLoaded) {
            const updatedAssociatedOutputs: IAssociatedOutput[] = [...associatedOutputs];
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

            const promiseMonitor = new PromiseMonitor((status: PromiseStatus) => {
                onAsyncStatusChange(status);
                if (status === PromiseStatus.DONE && mounted.current) {
                    setAssociatedOutputs(updatedAssociatedOutputs);
                    setOutputDetailsLoaded(true);
                }
            });

            const loadOutputDetails = async () => {
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

                const allPromises = Promise.all(promises).then(() => {
                    updatedAssociatedOutputs.sort((a, b) => {
                        const timestampBookedA = a.outputDetails?.metadata.milestoneTimestampBooked;
                        const timestampBookedB = b.outputDetails?.metadata.milestoneTimestampBooked;
                        return moment(timestampBookedA).isAfter(moment(timestampBookedB)) ? -1 : 1;
                    });
                }).catch(e => console.log(e));

                promiseMonitor.enqueue(async () => allPromises);
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
            if (mounted.current) {
                setCurrentPage(page);
            }
        }
    }, [associatedOutputs, pageNumber, outputDetailsLoaded]);

    if (isExcessiveOutputsSize) {
        return (
            <div className="section">
                <div className="section--header"><h2>Associated Outputs</h2></div>
                <div className="section--data">
                    <h4 className="value danger row middle center card padding-t-s padding-b-s">
                        Too much data
                    </h4>
                </div>
            </div>
        );
    }

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
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPage.map((associatedOutput, idx) => (
                            <AssociatedOutput
                                key={`${associatedOutput.outputId}${idx}`}
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
                            key={`${associatedOutput.outputId}${idx}`}
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

