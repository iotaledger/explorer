/* eslint-disable @typescript-eslint/no-shadow */
import classNames from "classnames";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { AssociationType } from "../../../models/api/stardust/IAssociationsResponse";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import NetworkContext from "../../context/NetworkContext";
import Pagination from "../Pagination";
import Spinner from "../Spinner";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import { ASSOCIATION_TYPE_TO_LABEL } from "./AssociatedOutputsUtils";
import "./AssociationSection.scss";

interface IAssociatedSectionProps {
    association: AssociationType;
    outputIds: string[] | undefined;
}

interface IOutputDetails {
    outputId: string;
    dateCreated: string;
    ago: string;
    amount: string;
}

const PAGE_SIZE = 10;

const AssociationSection: React.FC<IAssociatedSectionProps> = ({ association, outputIds }) => {
    const mounted = useRef(false);
    const { tokenInfo, name: network } = useContext(NetworkContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormatBalance, setIsFormatBalance] = useState(false);
    const [outputDetails, setOutputDetails] = useState<IOutputDetails[]>([]);
    const [page, setPage] = useState<IOutputDetails[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        const loadedOutputDetails: IOutputDetails[] = [];
        const promises: Promise<void>[] = [];
        const outputIdsToDetails: Map<string, IOutputDetails> = new Map();

        if (outputIds && isExpanded && mounted.current) {
            setIsLoading(true);
            for (const outputId of outputIds) {
                const outputDetailsPromise = new Promise<void>((resolve, reject) => {
                    tangleCacheService.outputDetails(network, outputId).then(outputDetails => {
                        if (outputDetails) {
                            const timestampBooked = outputDetails.metadata.milestoneTimestampBooked * 1000;
                            const dateCreated = DateHelper.formatShort(Number(timestampBooked));
                            const ago = moment(timestampBooked).fromNow();
                            const amount = outputDetails.output.amount;
                            outputIdsToDetails.set(outputId, { outputId, dateCreated, ago, amount });
                        }
                        resolve();
                    }).catch(e => reject(e));
                });

                promises.push(outputDetailsPromise);
            }

            Promise.all(promises).then(() => {
                for (const outputId of outputIds) {
                    const details = outputIdsToDetails.get(outputId);
                    if (details) {
                        const { dateCreated, ago, amount } = details;
                        loadedOutputDetails.push({ outputId, dateCreated, ago, amount });
                    }
                }

                setOutputDetails(loadedOutputDetails.reverse());
                setIsLoading(false);
            }).catch(e => console.log(e));
        }
    }, [outputIds, isExpanded]);

    // on page change handler
    useEffect(() => {
        if (outputDetails && mounted.current) {
            const from = (pageNumber - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE;

            const slicedDetails = outputDetails.slice(from, to);
            setPage(slicedDetails);
        }
    }, [outputDetails, pageNumber]);

    const count = outputIds?.length;

    return (
        count ?
            <div
                className="section association-section"
            >
                <div
                    className="row association-section--header"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className={classNames("margin-r-t", "dropdown", { opened: isExpanded })}>
                        <DropdownIcon />
                    </div>
                    <h3>{ASSOCIATION_TYPE_TO_LABEL[association]} ({count})</h3>
                </div>
                {isExpanded && isLoading && (
                    <Spinner />
                )}
                {!isExpanded || isLoading ? null : (
                    <React.Fragment>
                        <table className="association-section--table">
                            <thead>
                                <tr>
                                    <th>OUTPUT ID</th>
                                    <th>DATE CREATED</th>
                                    <th>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    page.map((details, idx) => {
                                        const { outputId, dateCreated, ago, amount } = details;
                                        return (
                                            <tr key={idx}>
                                                <td className="card">
                                                    {outputId}
                                                </td>
                                                <td className="date-created">{dateCreated} {ago}</td>
                                                <td className="amount">
                                                    <span
                                                        onClick={() => setIsFormatBalance(!isFormatBalance)}
                                                        className="pointer margin-r-5"
                                                    >
                                                        {formatAmount(Number(amount), tokenInfo, isFormatBalance)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>

                        <div className="association-section--cards">
                            {
                                page.map((details, idx) => {
                                    const { outputId, dateCreated, ago, amount } = details;

                                    return (
                                        <div key={idx} className="card">
                                            <div className="field">
                                                <div className="label">OUTPUT ID</div>
                                                <div className="value">{outputId}</div>
                                            </div>
                                            <div className="field">
                                                <div className="label">DATE CREATED</div>
                                                <div className="value">{dateCreated} {ago}</div>
                                            </div>
                                            <div className="field">
                                                <div className="label">AMOUNT</div>
                                                <div className="value">
                                                    <span
                                                        onClick={() => setIsFormatBalance(!isFormatBalance)}
                                                        className="pointer margin-r-5"
                                                    >
                                                        {formatAmount(Number(amount), tokenInfo, isFormatBalance)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        <Pagination
                            classNames="association-section--pagination"
                            currentPage={pageNumber}
                            totalCount={outputDetails.length}
                            pageSize={PAGE_SIZE}
                            siblingsCount={1}
                            onPageChange={number => setPageNumber(number)}
                        />
                    </React.Fragment>
                )}
            </div> : null
    );
};

export default AssociationSection;

