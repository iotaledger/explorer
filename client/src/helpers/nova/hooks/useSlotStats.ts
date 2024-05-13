import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { useNetworkInfoNova } from "../networkInfo";
import { ISlotAnalyticStatsResponse } from "~/models/api/nova/stats/ISlotAnalyticStatsResponse";

/**
 * Fetch the slot stats
 * @param network The Network in context
 * @param slotIndex The slot index
 * @returns The slot stats and a loading bool.
 */
export function useSlotStats(slotIndex: string | null): [ISlotAnalyticStatsResponse | null, boolean] {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [slotStats, setSlotStats] = useState<ISlotAnalyticStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setSlotStats(null);
        if (slotIndex) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .slotStats({
                        network,
                        slotIndex,
                    })
                    .then((response) => {
                        if (isMounted) {
                            setSlotStats(response ?? null);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, slotIndex]);

    return [slotStats, isLoading];
}
