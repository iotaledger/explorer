import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { IMilestoneAnalyticStats } from "~models/api/stats/IMilestoneAnalyticStats";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

/**
 * Fetch the milestone stats
 * @param network The Network in context
 * @param milestoneIndex The milestone index
 * @returns The milestone stats and a loading bool.
 */
export function useMilestoneStats(network: string, milestoneIndex: string | null): [IMilestoneAnalyticStats | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [milestoneStats, setMilestoneStats] = useState<IMilestoneAnalyticStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (milestoneIndex) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .milestoneStats({
                        network,
                        milestoneIndex,
                    })
                    .then((response) => {
                        if (isMounted) {
                            setMilestoneStats(response ?? null);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, milestoneIndex]);

    return [milestoneStats, isLoading];
}
