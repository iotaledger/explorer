import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IAnalyticStats } from "../../models/api/stats/IAnalyticStats";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";

/**
 * Constant in minutes to perform the chronicle analytics refresh.
 */
const CHRONICLE_ANALYTICS_REFRESH_MINUTES = 5;

/**
 * Periodicaly refresh chronicle analytic stats.
 * @param network The network in context.
 * @returns The Chronicle analytic stats.
 */
export function useChronicleAnalytics(network: string): [
    (IAnalyticStats | null)
] {
    const isMounted = useIsMounted();
    const [tangleCacheService] = useState(ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`));
    const [updateTimerId, setUpdateTimerId] = useState<NodeJS.Timer | null>(null);
    const [chronicleAnalyticStats, setChronicleAnalyticStats] = useState<IAnalyticStats | null>(null);

    useEffect(() => {
        if (updateTimerId) {
            clearTimeout(updateTimerId);
            setUpdateTimerId(null);
        }

        if (network) {
            // eslint-disable-next-line no-void
            void fetchAnalytics();

            setUpdateTimerId(
                setInterval(() => {
                    // eslint-disable-next-line no-void
                    void fetchAnalytics();
                }, CHRONICLE_ANALYTICS_REFRESH_MINUTES * 60 * 1000)
            );
        }

        return () => {
            if (updateTimerId) {
                clearInterval(updateTimerId);
                setUpdateTimerId(null);
            }
        };
    }, [network]);

    const fetchAnalytics = async () => {
        if (network) {
            const response = await tangleCacheService?.chronicleAnalytics(network);

            if (!response?.error && isMounted) {
                setChronicleAnalyticStats({
                    nativeTokens: response?.analyticStats?.nativeTokens,
                    nfts: response?.analyticStats?.nfts,
                    totalAddresses: response?.analyticStats?.totalAddresses,
                    dailyAddresses: response?.analyticStats?.dailyAddresses,
                    lockedStorageDeposit: response?.analyticStats?.lockedStorageDeposit,
                    unclaimedShimmer: response?.analyticStats?.unclaimedShimmer
                });
            } else {
                console.log("Analytics stats refresh failed.");
            }
        }
    };

    return [chronicleAnalyticStats];
}
