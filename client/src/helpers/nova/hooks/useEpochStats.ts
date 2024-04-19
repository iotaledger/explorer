import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { IEpochAnalyticStats } from "~/models/api/nova/stats/IEpochAnalyticStats";
import { useNetworkInfoNova } from "../networkInfo";

/**
 * Fetch the epoch stats
 * @param network The Network in context
 * @param epochIndex The epoch index
 * @returns The epoch stats and a loading bool.
 */
export function useEpochStats(epochIndex: string | null): [IEpochAnalyticStats | null, boolean] {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [epochStats, setEpochStats] = useState<IEpochAnalyticStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setEpochStats(null);
        if (epochIndex) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .epochStats({
                        network,
                        epochIndex,
                    })
                    .then((response) => {
                        if (isMounted) {
                            setEpochStats(response ?? null);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, epochIndex]);

    return [epochStats, isLoading];
}
