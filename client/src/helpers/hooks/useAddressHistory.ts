import { IOutputMetadataResponse, OutputResponse } from "@iota/sdk-wasm/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { ITransactionHistoryRequest } from "~models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryItem, ITransactionHistoryResponse } from "~models/api/stardust/ITransactionHistoryResponse";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { IOutputDetailsResponse } from "~models/api/stardust/IOutputDetailsResponse";
import { groupOutputsByTransactionId } from "~app/components/stardust/history/transactionHistoryUtils";

export interface IOutputDetailsMap {
    [outputId: string]: OutputResponse & { transactionHistory: ITransactionHistoryItem };
}

/**
 * Fetch Address history
 * @param network The Network in context
 * @param address The address in bech32 format
 * @param setDisabled Optional callback to signal there is no history.
 * @returns The history items, The map of outputId to output details, callback load next page, isLoading, hasMore
 */
export function useAddressHistory(
    network: string,
    address?: string,
    setDisabled?: (isDisabled: boolean) => void
): [ITransactionHistoryItem[], IOutputDetailsMap, () => void, boolean, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [history, setHistory] = useState<ITransactionHistoryItem[]>([]);
    const [outputDetailsMap, setOutputDetailsMap] = useState<IOutputDetailsMap>({});
    const [historyView, setHistoryView] = useState<ITransactionHistoryItem[]>([]);
    const [isAddressHistoryLoading, setIsAddressHistoryLoading] = useState(true);
    const [cursor, setCursor] = useState<string | undefined>();
    const TRANSACTIONS_PER_PAGE: number = 5;
    const [transactionsExpect, setTransactionsExpect] = useState<number>(TRANSACTIONS_PER_PAGE);
    const [transactions, setTransactions] = useState<{[k: string]: {transactionId: string; outputDetails: IOutputMetadataResponse[]}}>({});
    const hasMore = Boolean(cursor);
    const PAGE_SIZE: number = 10;
    const SORT: string = "newest";
    /** My changes start */
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        void loadTransactions();
    }, [address]);


    const loadTransactions = async () => {
        if (!address) return;

        setIsLoading(true);

        let currentCursor = cursor;
        let allTransactions = {...transactions};
        let shouldContinue = true;

        while(shouldContinue) {
            const request: ITransactionHistoryRequest = {
                network,
                address,
                pageSize: PAGE_SIZE,
                sort: SORT,
                cursor
            };
            const response = await apiClient.transactionHistory(request) as ITransactionHistoryResponse | undefined;

            const items = response?.items ?? [];
            console.log('--- response', response);

            if (!response || !isMounted) {
                setDisabled?.(true);
                setIsLoading(false);
                return;
            }

            for (const item of items) {
                const details = await apiClient.outputDetails({ network, outputId: item.outputId });
                if (details && details.output?.metadata) {
                    const { transactionIdSpent, transactionId } = details.output.metadata;
                    const transactionIdFinal = item.isSpent ? transactionIdSpent as string : transactionId;
                    const defaultTransaction = {
                        transactionId: transactionIdFinal,
                        outputDetails: []
                    };
                    const prevTransaction = allTransactions[transactionIdFinal] || defaultTransaction;
                    prevTransaction.outputDetails = [...prevTransaction.outputDetails, details.output.metadata];

                    allTransactions[transactionIdFinal] = prevTransaction;
                    //
                    // сформувати transactions
                    // outputDetailsMap[item.outputId] = { ...details.output, transactionHistory: item };
                }
        //
        //         // const transactionId = item.isSpent ? details.metadata.transactionIdSpent : details.metadata.transactionId;
        //         // loadedTransactions.set(transactionId, (loadedTransactions.get(transactionId) || 0) + 1);
            }

            console.log('--- allTransactions', allTransactions);

            // If number of transactions more than we expect or loaded all outputs
            if (Object.keys(allTransactions).length > transactionsExpect || !response?.cursor) {
                shouldContinue = false;
            }

        }
    }

    /** My changes end */
    // console.log('--- historyView', historyView);
    // useEffect(() => {
    //     loadHistory();
    // }, [address]);



    // const loadTransactions = async () => {
    //     if (address) {
    //         const outputs = await loadOutputs();
    //         const details = await attachDetails(outputs?.items);
    //         const groupedOutputs = groupOutputsByTransactionId(details);
    //         console.log('--- ', details);
    //         // setDisabled
    //     }
    // }

    const loadOutputs = async () => {
        if (!address) return;
        const request: ITransactionHistoryRequest = {
            network,
            address,
            pageSize: PAGE_SIZE,
            sort: SORT,
            cursor
        };

        const resp = await apiClient.transactionHistory(request) as ITransactionHistoryResponse | undefined;
        return {
            items: resp?.items ?? [],
            cursor: resp?.cursor
        };
    }

    const attachDetails = async (outputs?: ITransactionHistoryItem[]) => {
        const detailsPage: IOutputDetailsMap = {};

        if (!outputs) return;

        for (const output of outputs) {
            const response = await apiClient.outputDetails({ network, outputId: output.outputId }) as IOutputDetailsResponse;
            const details = response?.output;
            if (!response.error && details?.output && details?.metadata) {

                detailsPage[output.outputId] = {
                    output: details.output,
                    metadata: details.metadata,
                    transactionHistory: output
                };
            }
        }

        return detailsPage;
    }

    useEffect(() => {
        if (!address) return;
        loadTransactions();
    }, [address]);

    const loadHistory = () => {
        if (address) {
            setIsAddressHistoryLoading(true);
            const request: ITransactionHistoryRequest = {
                network,
                address,
                pageSize: PAGE_SIZE,
                sort: SORT,
                cursor
            };

            apiClient.transactionHistory(request)
                .then((response: ITransactionHistoryResponse | undefined) => {
                    const items = response?.items ?? [];
                    if (items.length > 0 && isMounted) {
                        setHistory([...history, ...items]);
                        // console.log('--- response?.cursor', response?.cursor);
                        setCursor(response?.cursor);
                    } else if (setDisabled && isMounted) {
                        setDisabled(true);
                    }
                })
                .finally(() => {
                    setIsAddressHistoryLoading(false);
                });
        }
    };

    useEffect(() => {
        if (history.length > 0) {
            setIsAddressHistoryLoading(true);
            const promises: Promise<void>[] = [];
            const detailsPage: IOutputDetailsMap = {};

            for (const item of history) {
                const promise = apiClient.outputDetails({ network, outputId: item.outputId })
                    .then(response => {
                        const details = response.output;
                        if (!response.error && details?.output && details?.metadata) {
                            const outputDetails = {
                                output: details.output,
                                metadata: details.metadata
                            };

                            detailsPage[item.outputId] = outputDetails;
                        }
                    })
                    .catch(e => console.log(e));

                promises.push(promise);
            }

            Promise.allSettled(promises)
                .then(_ => {
                    if (isMounted) {
                        setOutputDetailsMap(detailsPage);
                        setIsAddressHistoryLoading(false);
                        const updatedHistoryView = [...history].sort((a, b) => {
                            // Ensure that entries with equal timestamp, but different isSpent,
                            // have the spending before the depositing
                            if (a.milestoneTimestamp === b.milestoneTimestamp && a.isSpent !== b.isSpent) {
                                return a.isSpent ? 1 : -1;
                            }
                            return 1;
                        });

                        setHistoryView(updatedHistoryView);
                    }
                }).catch(_ => {
                    console.log("Failed loading transaction history details!");
                })
                .finally(() => {
                    setIsAddressHistoryLoading(false);
                });
        }
    }, [history]);

    return [historyView, outputDetailsMap, loadHistory, isAddressHistoryLoading, hasMore];
}

