/* eslint-disable @typescript-eslint/no-shadow */
import classNames from "classnames";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { AssociationType } from "../../../models/api/stardust/IAssociationsResponse";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import NetworkContext from "../../context/NetworkContext";
import Spinner from "../Spinner";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import { ASSOCIATION_TYPE_TO_LABEL } from "./AssociatedOutputsUtils";
import "./AssociationSection.scss";
import TruncatedId from "./TruncatedId";

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
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormatBalance, setIsFormatBalance] = useState(false);
    const [jobToStatus, setJobToStatus] = useState(PromiseStatus.PENDING);
    const [loadMoreCounter, setLoadMoreCounter] = useState<number | undefined>();
    const [outputDetails, setOutputDetails] = useState<IOutputDetails[]>([]);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        const loadedOutputDetails: IOutputDetails[] = [];
        const outputIdsToDetails: Map<string, IOutputDetails> = new Map();

        if (outputIds && loadMoreCounter !== undefined) {
            const from = loadMoreCounter * PAGE_SIZE;
            const to = from + PAGE_SIZE;
            const sliceToLoad = outputIds.slice(from, to);

            const loadOutputDetailsMonitor = new PromiseMonitor(status => {
                setJobToStatus(status);
                // This actually happends after all promises are DONE
                if (status === PromiseStatus.DONE) {
                    for (const outputId of sliceToLoad) {
                        const details = outputIdsToDetails.get(outputId);
                        if (details) {
                            const { dateCreated, ago, amount } = details;
                            loadedOutputDetails.push({ outputId, dateCreated, ago, amount });
                        }
                    }

                    if (mounted.current) {
                        setOutputDetails(outputDetails.concat(loadedOutputDetails));
                    }
                }
            });

            for (const outputId of sliceToLoad) {
                // eslint-disable-next-line no-void
                void loadOutputDetailsMonitor.enqueue(
                    async () => tangleCacheService.outputDetails(network, outputId).then(outputDetails => {
                        if (outputDetails.output && outputDetails.metadata) {
                            const timestampBooked = outputDetails.metadata.milestoneTimestampBooked * 1000;
                            const dateCreated = DateHelper.formatShort(Number(timestampBooked));
                            const ago = moment(timestampBooked).fromNow();
                            const amount = outputDetails.output.amount;
                            outputIdsToDetails.set(outputId, { outputId, dateCreated, ago, amount });
                        } else if (outputDetails.error) {
                            console.log(`Error while loading associated output details for ${outputId}`);
                        }
                    })
                );
            }
        }
    }, [outputIds, loadMoreCounter]);

    const onExpandSection = () => {
        setIsExpanded(!isExpanded);
        if (loadMoreCounter === undefined) {
            setLoadMoreCounter(0);
        }
    };

    const onLoadMore = () => {
        setLoadMoreCounter(
            loadMoreCounter === undefined ?
                0 :
                loadMoreCounter + 1
        );
    };

    const count = outputIds?.length;
    const isLoading = jobToStatus !== PromiseStatus.DONE;

    return (
        count ?
            <div className="section association-section">
                <div
                    className="row association-section--header middle pointer"
                    onClick={onExpandSection}
                >
                    <div className={classNames("margin-r-t", "dropdown", { opened: isExpanded })}>
                        <DropdownIcon />
                    </div>
                    <h3 className="association-label">{ASSOCIATION_TYPE_TO_LABEL[association]} ({count})</h3>
                    {isExpanded && isLoading && (
                        <div className="margin-l-t">
                            <Spinner />
                        </div>
                    )}
                </div>
                {!isExpanded || outputDetails.length === 0 ? null : (
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
                                {outputDetails.map((details, idx) => {
                                    const { outputId, dateCreated, ago, amount } = details;

                                    return (
                                        <tr key={idx}>
                                            <td className="card">
                                                <Link
                                                    to={`/${network}/output/${outputId}`}
                                                    className="margin-r-t output-id"
                                                >
                                                    <TruncatedId id={outputId} />
                                                </Link>
                                            </td>
                                            <td className="date-created">{dateCreated} ({ago})</td>
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
                                })}
                            </tbody>
                        </table>

                        <div className="association-section--cards">
                            {outputDetails.map((details, idx) => {
                                const { outputId, dateCreated, ago, amount } = details;
                                const outputIdShort = `${outputId.slice(0, 11)}....${outputId.slice(-11)}`;

                                return (
                                    <div key={idx} className="card">
                                        <div className="field">
                                            <div className="label">Output Id</div>
                                            <Link
                                                to={`/${network}/output/${outputId}`}
                                                className="margin-r-t value"
                                            >
                                                <span className="highlight">{outputIdShort}</span>
                                            </Link>
                                        </div>
                                        <div className="field">
                                            <div className="label">Date Created</div>
                                            <div className="value date-created">{dateCreated} ({ago})</div>
                                        </div>
                                        <div className="field">
                                            <div className="label">Amount</div>
                                            <div className="value amount">
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
                            })}
                        </div>
                        {outputDetails.length < count && (
                            <div className="card load-more--button">
                                <button onClick={onLoadMore} type="button" disabled={isLoading} >
                                    Load more...
                                </button>
                            </div>
                        )}
                    </React.Fragment>
                )}
            </div> : null
    );
};

export default AssociationSection;

