/* eslint-disable no-void */
import { IOutputResponse } from "@iota/iota.js-stardust";
import React, { useCallback, useEffect, useRef, useState } from "react";
import transactionHistoryMessage from "../../../../assets/modals/stardust/address/transaction-history.json";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { AsyncProps } from "../../../../helpers/promise/AsyncProps";
import PromiseMonitor, { PromiseStatus } from "../../../../helpers/promise/promiseMonitor";
import { ITransactionHistoryRequest } from "../../../../models/api/stardust/ITransactionHistoryRequest";
import {
    ITransactionHistoryItem, ITransactionHistoryResponse
} from "../../../../models/api/stardust/ITransactionHistoryResponse";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../../services/stardust/stardustTangleCacheService";
import Modal from "../../../components/Modal";
import Spinner from "../../Spinner";
import TransactionCard from "./TransactionCard";
import TransactionRow from "./TransactionRow";
import "./TransactionHistory.scss";

interface TransactionHistoryProps {
    network: string;
    address: string;
}

interface IOutputDetailsMap {
    [outputId: string]: IOutputResponse;
}

const PAGE_SIZE: number = 10;
const SORT: string = "newest";

const TransactionHistory: React.FC<TransactionHistoryProps & AsyncProps> = (
    { network, address, onAsyncStatusChange }
) => {
    const mounted = useRef(false);
    const [history, setHistory] = useState<ITransactionHistoryItem[]>([]);
    const [outputDetailsMap, setOutputDetailsMap] = useState<IOutputDetailsMap>({});
    const [historyView, setHistoryView] = useState<ITransactionHistoryItem[]>([]);

    const [cursor, setCursor] = useState<string | undefined>();
    const [isFormattedAmounts, setIsFormattedAmounts] = useState(true);

    const [isLoading, setIsLoading] = useState(true);

    const unmount = () => {
        mounted.current = false;
    };

    const tangleService = useCallback(
        () => ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`),
        [network, address]
    );

    useEffect(() => {
        mounted.current = true;
        loadHistory();
        setHistoryView(history);

        return unmount;
    }, [network, address]);

    const loadHistory = () => {
        const request: ITransactionHistoryRequest = {
            network,
            address,
            pageSize: PAGE_SIZE,
            sort: SORT,
            cursor
        };

        tangleService().transactionHistory(request)
            .then((response: ITransactionHistoryResponse | undefined) => {
                if (response?.items && mounted.current) {
                    setHistory([...history, ...response.items]);
                    setCursor(response.cursor);
                }
            })
            .catch(e => console.log(e));
    };

    useEffect(() => {
        if (history.length > 0) {
            const promises: Promise<void>[] = [];
            const detailsPage: IOutputDetailsMap = {};

            const promiseMonitor = new PromiseMonitor((status: PromiseStatus) => {
                onAsyncStatusChange(status);
                if (status === PromiseStatus.DONE && mounted.current) {
                    setOutputDetailsMap(detailsPage);
                    setIsLoading(false);
                    const updatedHistoryView = [...history].sort((a, b) => {
                        // Ensure that entries with equal timestamp, but different isSpent,
                        // have the spending before the depositing
                        if (a.milestoneTimestamp === b.milestoneTimestamp && a.isSpent !== b.isSpent) {
                            return !a.isSpent ? -1 : 1;
                        }
                        return 1;
                    });

                    setHistoryView(updatedHistoryView);
                }
            });

            const fetchDetails = async () => {
                for (const item of history) {
                    const promise = tangleService().outputDetails(network, item.outputId)
                        .then(response => {
                            if (!response.error && response.output && response.metadata) {
                                const outputDetails = {
                                    output: response.output,
                                    metadata: response.metadata
                                };

                                detailsPage[item.outputId] = outputDetails;
                            }
                        })
                        .catch(e => console.log(e));

                    promises.push(promise);
                }

                const allPromises = Promise.all(promises);
                void promiseMonitor.enqueue(async () => allPromises);
            };

            void fetchDetails();
        }
    }, [history]);

    const loadMoreHandler = () => {
        if (mounted.current) {
            setIsLoading(true);
            loadHistory();
        }
    };

    let isDarkBackgroundRow = false;

    return (historyView.length > 0 ? (
        <div className="section transaction-history--section">
            <div className="section--header row space-between">
                <div className="row middle">
                    <h2>
                        Transaction History
                    </h2>
                    <Modal icon="info" data={transactionHistoryMessage} />
                </div>
                <div className="margin-t-s middle row">
                    {isLoading && <Spinner />}
                </div>
            </div>
            <table className="transaction-history--table">
                <thead>
                    <tr>
                        <th>Transaction Id</th>
                        <th>Output Id</th>
                        <th>Date</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {historyView.length > 0 && (
                        historyView.map((historyItem, idx) => {
                            const outputDetails = outputDetailsMap[historyItem.outputId];
                            if (!outputDetails) {
                                return null;
                            }
                            const transactionId = historyItem.isSpent ?
                                outputDetails.metadata.transactionIdSpent :
                                outputDetails.metadata.transactionId;

                            if (!transactionId) {
                                return null;
                            }

                            // rotate row background colour for different transaction ids
                            if (idx > 0) {
                                const previousItemDetails = outputDetailsMap[historyView[idx - 1].outputId];
                                const previousSpent = historyView[idx - 1].isSpent;
                                if (previousItemDetails) {
                                    const previousTransactionId = previousSpent ?
                                        previousItemDetails.metadata.transactionIdSpent :
                                        previousItemDetails.metadata.transactionId;

                                    if (transactionId !== previousTransactionId) {
                                        isDarkBackgroundRow = !isDarkBackgroundRow;
                                    }
                                }
                            }

                            return (
                                <React.Fragment key={idx}>
                                    <TransactionRow
                                        outputId={historyItem.outputId}
                                        transactionId={transactionId}
                                        date={historyItem.milestoneTimestamp}
                                        value={Number(outputDetails.output.amount)}
                                        isSpent={historyItem.isSpent}
                                        isFormattedAmounts={isFormattedAmounts}
                                        setIsFormattedAmounts={setIsFormattedAmounts}
                                        darkBackgroundRow={isDarkBackgroundRow}
                                    />
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Only visible in mobile -- Card transactions*/}
            <div className="transaction-history--cards">
                {historyView.length > 0 && (
                    historyView.map((historyItem, idx) => {
                        const outputDetails = outputDetailsMap[historyItem.outputId];
                        if (!outputDetails) {
                            return null;
                        }
                        const transactionId = historyItem.isSpent ?
                            outputDetails.metadata.transactionIdSpent :
                            outputDetails.metadata.transactionId;

                        if (!transactionId) {
                            return null;
                        }

                        return (
                            <React.Fragment key={idx}>
                                <TransactionCard
                                    outputId={historyItem.outputId}
                                    transactionId={transactionId}
                                    date={historyItem.milestoneTimestamp}
                                    value={Number(outputDetails.output.amount)}
                                    isSpent={historyItem.isSpent}
                                    isFormattedAmounts={isFormattedAmounts}
                                    setIsFormattedAmounts={setIsFormattedAmounts}
                                />
                            </React.Fragment>
                        );
                    })
                )}
            </div>
            {cursor && historyView.length > 0 && (
                <div className="card load-more--button" onClick={loadMoreHandler}>
                    <button type="button">Load more...</button>
                </div>
            )}
        </div>) : null
    );
};

export default TransactionHistory;

