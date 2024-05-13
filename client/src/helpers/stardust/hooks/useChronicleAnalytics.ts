import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { IAnalyticStats } from "~models/api/stats/IAnalyticStats";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

/**
 * Constant in minutes to perform the chronicle analytics refresh.
 */
const CHRONICLE_ANALYTICS_REFRESH_MINUTES = 5;

/**
 * Periodicaly refresh chronicle analytic stats.
 * @param network The network in context.
 * @returns The Chronicle analytic stats.
 */
export function useChronicleAnalytics(network: string): [IAnalyticStats | null] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
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
                setInterval(
                    () => {
                        // eslint-disable-next-line no-void
                        void fetchAnalytics();
                    },
                    CHRONICLE_ANALYTICS_REFRESH_MINUTES * 60 * 1000,
                ),
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
            const analyticStats = await apiClient.chronicleAnalytics({ network });

            if (!analyticStats?.error && isMounted) {
                setChronicleAnalyticStats({
                    nativeTokens: analyticStats?.nativeTokens,
                    nfts: analyticStats?.nfts,
                    totalAddresses: analyticStats?.totalAddresses,
                    dailyAddresses: analyticStats?.dailyAddresses,
                    lockedStorageDeposit: analyticStats?.lockedStorageDeposit,
                    unclaimedShimmer: analyticStats?.unclaimedShimmer,
                });
            } else {
                console.error("Analytics stats refresh failed.");
            }
        }
    };

    return [chronicleAnalyticStats];
}
