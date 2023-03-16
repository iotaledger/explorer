import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IMilestoneAnalyticStats } from "../../models/api/stats/IMilestoneAnalyticStats";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";

/**
 * Fetch the milestone stats
 * @param network The Network in context
 * @param milestoneIndex The milestone index
 * @returns The milestone stats and a loading bool.
 */
export function useMilestoneStats(network: string, milestoneIndex: string | null):
    [
        IMilestoneAnalyticStats | null,
        boolean
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [milestoneStats, setMilestoneStats] = useState<IMilestoneAnalyticStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (milestoneIndex) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.milestoneStats(
                    network,
                    milestoneIndex
                ).then(response => {
                    setMilestoneStats(response ?? null);
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, milestoneIndex]);

    return [milestoneStats, isLoading];
}
