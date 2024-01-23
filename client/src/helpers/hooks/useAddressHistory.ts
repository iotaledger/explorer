import { useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { ITransactionHistoryRequest } from "~models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryItem, ITransactionHistoryResponse } from "~models/api/stardust/ITransactionHistoryResponse";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { groupOutputsByTransactionId } from "~app/components/stardust/history/transactionHistoryUtils";
import { OutputResponse } from "@iota/sdk-wasm/web";

const OUTPUT_PAGE_SIZE = 10;
const TX_PAGE_SIZE = 10;

const SORT = "newest";

interface IHistoryState {
    transactionIdToOutputs: Map<string, OutputWithDetails[]>;
    outputsWithDetails: OutputWithDetails[];
    isAddressHistoryLoading: boolean;
    cursor: string | undefined;
}

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
    const [apiClient] = useState(() => ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [historyState, setHistoryState] = useState<IHistoryState>({
        transactionIdToOutputs: new Map<string, OutputWithDetails[]>(),
        outputsWithDetails: [],
        isAddressHistoryLoading: true,
        cursor: undefined,
    });

    useEffect(() => {
        if (!address || !isMounted) return;
        (async () => {
            await loadHistory();
        })();
    }, [address, isMounted]);

    const requestOutputsList = async (
        cursor: string | undefined,
    ): Promise<{ outputs: ITransactionHistoryItem[]; cursor: string | undefined }> => {
        if (!address) return { outputs: [], cursor: undefined };

        const request: ITransactionHistoryRequest = {
            network,
            address,
            pageSize: OUTPUT_PAGE_SIZE,
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

    const requestOutputDetails = async (outputId: string): Promise<OutputResponse | null> => {
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
        let { transactionIdToOutputs, outputsWithDetails, cursor } = historyState;
        // Search one more than the desired so the incomplete transaction can be removed with .pop()
        const targetSize = transactionIdToOutputs.size + TX_PAGE_SIZE + 1;
        let searchMore = true;

        setHistoryState((prevState) => ({ ...prevState, isAddressHistoryLoading: true }));

        while (transactionIdToOutputs.size < targetSize && searchMore) {
            try {
                const { outputs, cursor: newCursor } = await requestOutputsList(cursor);

                if (!newCursor) {
                    setDisabled?.(true);
                    searchMore = false;
                }

                const fulfilledOutputs: OutputWithDetails[] = await Promise.all(
                    outputs.map(async (output) => {
                        const details = await requestOutputDetails(output.outputId);
                        return {
                            ...output,
                            details,
                            amount: details?.output?.amount,
                        };
                    }),
                );

                outputsWithDetails = [...outputsWithDetails, ...fulfilledOutputs].sort((a, b) => {
                    // Ensure that entries with equal timestamp, but different isSpent,
                    // have the spending before the depositing
                    if (a.milestoneTimestamp === b.milestoneTimestamp && a.isSpent !== b.isSpent) {
                        return a.isSpent ? 1 : -1;
                    }
                    return 1;
                });

                transactionIdToOutputs = groupOutputsByTransactionId(outputsWithDetails);
                cursor = newCursor;
            } catch (error) {
                console.error("Failed loading transaction history", error);
                searchMore = false;
            }
        }
        setHistoryState({ transactionIdToOutputs, outputsWithDetails, isAddressHistoryLoading: false, cursor });
    };

    return [historyState.transactionIdToOutputs, loadHistory, historyState.isAddressHistoryLoading, Boolean(historyState.cursor)];
}
