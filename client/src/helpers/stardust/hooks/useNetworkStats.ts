import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

/**
 * Periodicaly refresh network stats.
 * @param network The network in context.
 * @returns The network stats.
 */
export function useNetworkStats(network: string): [string, string, string, number[]] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [updateTimerId, setUpdateTimerId] = useState<NodeJS.Timer | null>(null);
    const [blocksPerSecond, setBlocksPerSecond] = useState<string>("--");
    const [blocksPerSecondHistory, setBlocksPerSecondHistory] = useState<number[]>([]);
    const [confirmedBlocksPerSecond, setConfirmedBlocksPerSecond] = useState<string>("--");
    const [confirmedBlocksPerSecondPercent, setConfirmedBlocksPerSecondPercent] = useState<string>("--");

    useEffect(() => {
        if (network) {
            updateNetworkStats();
        }

        return () => {
            if (updateTimerId) {
                clearTimeout(updateTimerId);
                setUpdateTimerId(null);
            }
        };
    }, [network]);

    const updateNetworkStats = () => {
        if (isMounted && apiClient && network) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            apiClient
                .stats({
                    network,
                    includeHistory: true,
                })
                .then((ips) => {
                    const itemsPerSecond = ips.itemsPerSecond ?? 0;
                    const confirmedItemsPerSecond = ips.confirmedItemsPerSecond ?? 0;
                    const confirmedRate = ips.confirmationRate ? (ips.confirmationRate > 100 ? 100 : ips.confirmationRate) : 0;

                    setBlocksPerSecond(itemsPerSecond >= 0 ? itemsPerSecond.toFixed(2) : "--");
                    setConfirmedBlocksPerSecond(confirmedItemsPerSecond >= 0 ? confirmedItemsPerSecond.toFixed(2) : "--");
                    setConfirmedBlocksPerSecondPercent(confirmedRate > 0 ? `${confirmedRate.toFixed(2)}%` : "--");
                    setBlocksPerSecondHistory((ips.itemsPerSecondHistory ?? []).map((v) => v + 100));
                })
                .catch((err) => {
                    console.error(err);
                })
                .finally(() => {
                    setUpdateTimerId(setTimeout(async () => updateNetworkStats(), 4000));
                });
        }
    };

    return [blocksPerSecond, confirmedBlocksPerSecond, confirmedBlocksPerSecondPercent, blocksPerSecondHistory];
}
