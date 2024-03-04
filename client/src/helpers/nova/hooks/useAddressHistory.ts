import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { ITransactionHistoryRequest } from "~models/api/nova/ITransactionHistoryRequest";
import { ITransactionHistoryItem, ITransactionHistoryResponse } from "~models/api/nova/ITransactionHistoryResponse";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~services/nova/novaApiClient";
import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { groupOutputsByTransactionId } from "../transactionHistoryUtils";

const OUTPUT_PAGE_SIZE = 10;
const TX_PAGE_SIZE = 10;

const SORT = "newest";

interface IHistoryState {
    transactionIdToOutputs: Map<string, OutputWithDetails[]>;
    outputsWithDetails: OutputWithDetails[];
    isAddressHistoryLoading: boolean;
    cursor: string | undefined;
}

export type OutputWithDetails = ITransactionHistoryItem & { details: OutputWithMetadataResponse | null; amount?: string };

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
    const [apiClient] = useState(() => ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
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

    const requestOutputDetails = async (outputId: string): Promise<OutputWithMetadataResponse | null> => {
        if (!outputId) return null;

        try {
            const response = await apiClient.outputDetails({ network, outputId });
            const details = response.output;

            if (!response.error && details?.output && details?.metadata) {
                return details;
            }
            return null;
        } catch {
            console.error("Failed loading transaction history details!");
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
                    // Note: newCursor can be null if there are no more pages, and undefined if there are no results
                    searchMore = false;
                }

                if (!newCursor && outputs.length === 0 && transactionIdToOutputs.size === 0) {
                    // hide the tab only if there are no results
                    setDisabled?.(true);
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
                    if (a.slotIndex === b.slotIndex && a.isSpent !== b.isSpent) {
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
