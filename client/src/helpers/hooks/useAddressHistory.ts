import { OutputResponse } from "@iota/sdk-wasm/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { ITransactionHistoryRequest } from "~models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryItem, ITransactionHistoryResponse } from "~models/api/stardust/ITransactionHistoryResponse";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

export interface IOutputDetailsMap {
    [outputId: string]: OutputResponse;
}

type OutputWithDetails = ITransactionHistoryItem & { details: OutputResponse | null };

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
    const [outputsWithDetails, setOutputsWithDetails] = useState<OutputWithDetails[]>([]);
    const [history, setHistory] = useState<ITransactionHistoryItem[]>([]);
    const [outputDetailsMap, setOutputDetailsMap] = useState<IOutputDetailsMap>({});
    const [historyView, setHistoryView] = useState<ITransactionHistoryItem[]>([]);
    const [isAddressHistoryLoading, setIsAddressHistoryLoading] = useState(true);
    const [cursor, setCursor] = useState<string | undefined>();
    const PAGE_SIZE: number = 25;
    const SORT: string = "newest";

    useEffect(() => {
        if (!address) return;
        void loadHistory();
    }, [address]);


    const requestOutputsList = async () => {
        if (!address) return;

        const request: ITransactionHistoryRequest = {
            network,
            address,
            pageSize: PAGE_SIZE,
            sort: SORT,
            cursor
        };

        const response = await apiClient.transactionHistory(request) as ITransactionHistoryResponse | undefined;
        const items = response?.items ?? [];
        return {
            outputs: items,
            cursor: response?.cursor
        }
    };

    const requestOutputDetails = async (outputId: string) => {
        if (!outputId) return null;

        try {
            const response = await apiClient.outputDetails({ network, outputId });
            const details = response.output;

            if (!response.error && details?.output && details?.metadata) {
                return details;
            }
            return null;
        } catch {
            console.log("Failed loading transaction history details!");
            return null;
        }

    }


    const loadHistory = async () => {
        if (address) {
            setIsAddressHistoryLoading(true);

            try {
                const outputList = await requestOutputsList();

                if (!outputList) {
                    return;
                }

                const { outputs, cursor } = outputList;

                const fulfilledOutputs: OutputWithDetails[] = [];

                for (const output of outputs) {
                    const outputDetails = await requestOutputDetails(output.outputId);
                    fulfilledOutputs.push({ ...output, details: outputDetails });
                }

                const updatedOutputWithDetails = [...outputsWithDetails, ...fulfilledOutputs];

                updatedOutputWithDetails.sort((a, b) => {
                    // Ensure that entries with equal timestamp, but different isSpent,
                    // have the spending before the depositing
                    if (a.milestoneTimestamp === b.milestoneTimestamp && a.isSpent !== b.isSpent) {
                        return a.isSpent ? 1 : -1;
                    }
                    return 1;
                });

                setOutputsWithDetails([...outputsWithDetails, ...fulfilledOutputs]);
                setCursor(cursor);
            } finally {
                setIsAddressHistoryLoading(false);
            }
        }
    };

    // useEffect(() => {
    //     return;
    //     if (history.length > 0) {
    //         setIsAddressHistoryLoading(true);
    //         const promises: Promise<void>[] = [];
    //         const detailsPage: IOutputDetailsMap = {};
    //
    //         for (const item of history) {
    //             const promise = apiClient.outputDetails({ network, outputId: item.outputId })
    //                 .then(response => {
    //
    //                 })
    //                 .catch(e => console.log(e));
    //
    //             promises.push(promise);
    //         }
    //
    //         Promise.allSettled(promises)
    //             .then(_ => {
    //                 if (isMounted) {
    //                     setOutputDetailsMap(detailsPage);
    //                     setIsAddressHistoryLoading(false);
    //                     const updatedHistoryView = [...history]
    //
    //                     setHistoryView(updatedHistoryView);
    //                 }
    //             }).catch(_ => {
    //             })
    //             .finally(() => {
    //                 setIsAddressHistoryLoading(false);
    //             });
    //     }
    // }, [history]);

    return [historyView, outputDetailsMap, loadHistory, isAddressHistoryLoading, Boolean(cursor)];
}

