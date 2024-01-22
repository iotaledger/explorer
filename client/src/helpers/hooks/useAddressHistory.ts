import { OutputResponse } from "@iota/sdk-wasm/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { ITransactionHistoryRequest } from "~models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryItem, ITransactionHistoryResponse } from "~models/api/stardust/ITransactionHistoryResponse";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { groupOutputsByTransactionId } from "~app/components/stardust/history/transactionHistoryUtils";

export type OutputWithDetails = ITransactionHistoryItem & { details: OutputResponse | null; amount?: string };

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
    setDisabled?: (isDisabled: boolean) => void,
): [Map<string, OutputWithDetails[]>, () => void, boolean, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [outputsWithDetails, setOutputsWithDetails] = useState<OutputWithDetails[]>([]);
    const [transactionIdToOutputs, setTransactionIdToOutputs] = useState<Map<string, OutputWithDetails[]>>(new Map());
    const [isAddressHistoryLoading, setIsAddressHistoryLoading] = useState(true);
    const [cursor, setCursor] = useState<string | undefined>();
    const PAGE_SIZE: number = 10;
    const SORT: string = "newest";

    useEffect(() => {
        if (!address || !isMounted) return;
        (async () => {
            await loadHistory();
        })();
    }, [address, isMounted]);

    const requestOutputsList = async () => {
        if (!address) return;

        const request: ITransactionHistoryRequest = {
            network,
            address,
            pageSize: PAGE_SIZE,
            sort: SORT,
            cursor,
        };

        const response = (await apiClient.transactionHistory(request)) as ITransactionHistoryResponse | undefined;
        const items = response?.items ?? [];
        return {
            outputs: items,
            cursor: response?.cursor,
        };
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
    };

    const loadHistory = async () => {
        if (address && isMounted) {
            setIsAddressHistoryLoading(true);

            try {
                const outputList = await requestOutputsList();

                if (!outputList) {
                    return;
                }

                const { outputs, cursor } = outputList;

                if (!cursor) {
                    setDisabled?.(true);
                }

                const fulfilledOutputs: OutputWithDetails[] = [];

                for (const output of outputs) {
                    const outputDetails = await requestOutputDetails(output.outputId);
                    fulfilledOutputs.push({ ...output, details: outputDetails, amount: outputDetails?.output?.amount });
                }

                const updatedOutputsWithDetails = [...outputsWithDetails, ...fulfilledOutputs];

                updatedOutputsWithDetails.sort((a, b) => {
                    // Ensure that entries with equal timestamp, but different isSpent,
                    // have the spending before the depositing
                    if (a.milestoneTimestamp === b.milestoneTimestamp && a.isSpent !== b.isSpent) {
                        return a.isSpent ? 1 : -1;
                    }
                    return 1;
                });

                const groupedOutputsByTransactionId = groupOutputsByTransactionId(updatedOutputsWithDetails);

                setTransactionIdToOutputs(groupedOutputsByTransactionId);
                setOutputsWithDetails([...outputsWithDetails, ...fulfilledOutputs]);
                setCursor(cursor);
            } finally {
                setIsAddressHistoryLoading(false);
            }
        }
    };

    return [transactionIdToOutputs, loadHistory, isAddressHistoryLoading, Boolean(cursor)];
}
