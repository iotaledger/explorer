import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~services/nova/novaApiClient";

/**
 * Periodicaly refresh network stats.
 * @param network The network in context.
 * @returns The network stats.
 */
export function useNetworkStats(network: string): { blocksPerSecond: string; confirmationRate: string } {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [updateTimerId, setUpdateTimerId] = useState<NodeJS.Timer | null>(null);
    const [blocksPerSecond, setBlocksPerSecond] = useState<string>("--");
    const [confirmationRate, setConfirmationRate] = useState<string>("--");

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
            apiClient
                .stats({
                    network,
                    includeHistory: true,
                })
                .then((ips) => {
                    const itemsPerSecond = ips.itemsPerSecond ?? 0;
                    setBlocksPerSecond(itemsPerSecond >= 0 ? itemsPerSecond.toFixed(2) : "--");
                    setConfirmationRate(ips.confirmationRate !== undefined ? ips.confirmationRate.toFixed(2) : "--");
                })
                .catch((err) => {
                    console.error(err);
                })
                .finally(() => {
                    setUpdateTimerId(setTimeout(async () => updateNetworkStats(), 4000));
                });
        }
    };

    return { blocksPerSecond, confirmationRate };
}
