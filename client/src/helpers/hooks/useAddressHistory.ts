import { IOutputResponse } from "@iota/iota.js-stardust";
import { useCallback, useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryItem, ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";

interface IOutputDetailsMap {
    [outputId: string]: IOutputResponse;
}

/**
 * Fetch Address history
 * @param network The Network in context
 * @param address The address in bech32 format
 * @returns The history items, The map of outputId to output details, callback load next page, isLoading, hasMore
 */
export function useAddressHistory(
    network: string,
    address?: string
): [ITransactionHistoryItem[], IOutputDetailsMap, () => void, boolean, boolean] {
    const isMounted = useIsMounted();
    const tangleService = useCallback(
        () => ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`),
        [network, address]
    );
    const [history, setHistory] = useState<ITransactionHistoryItem[]>([]);
    const [outputDetailsMap, setOutputDetailsMap] = useState<IOutputDetailsMap>({});
    const [historyView, setHistoryView] = useState<ITransactionHistoryItem[]>([]);
    const [isAddressHistoryLoading, setIsAddressHistoryLoading] = useState(true);
    const [cursor, setCursor] = useState<string | undefined>();
    const PAGE_SIZE: number = 10;
    const SORT: string = "newest";

    useEffect(() => {
        loadHistory();
    }, [address]);

    const loadHistory = () => {
        if (address) {
            const request: ITransactionHistoryRequest = {
                network,
                address,
                pageSize: PAGE_SIZE,
                sort: SORT,
                cursor
            };

            tangleService().transactionHistory(request)
                .then((response: ITransactionHistoryResponse | undefined) => {
                    const items = response?.items ?? [];

                    if (items.length > 0 && isMounted) {
                        setHistory([...history, ...items]);
                        setCursor(response?.cursor);
                    }
                })
                .catch(e => console.log(e));
        }
    };

    useEffect(() => {
        if (history.length > 0) {
            const promises: Promise<void>[] = [];
            const detailsPage: IOutputDetailsMap = {};

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

            Promise.all(promises).then(_ => {
                setOutputDetailsMap(detailsPage);
                setIsAddressHistoryLoading(false);
                const updatedHistoryView = [...history].sort((a, b) => {
                    // Ensure that entries with equal timestamp, but different isSpent,
                    // have the spending before the depositing
                    if (a.milestoneTimestamp === b.milestoneTimestamp && a.isSpent !== b.isSpent) {
                        return !a.isSpent ? -1 : 1;
                    }
                    return 1;
                });

                setHistoryView(updatedHistoryView);
            }).catch(_ => {
                console.log("Failed loading transaction history details!");
            })
            .finally(() => {
                setIsAddressHistoryLoading(false);
            });
        }
    }, [history]);

    return [historyView, outputDetailsMap, loadHistory, isAddressHistoryLoading, Boolean(cursor)];
}

