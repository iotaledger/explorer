import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { IAnalyticStats } from "~/models/api/nova/stats/IAnalyticStats";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~services/nova/novaApiClient";
import { useNetworkInfoNova } from "../networkInfo";

/**
 * Constant in minutes to perform the chronicle analytics refresh.
 */
const CHRONICLE_ANALYTICS_REFRESH_MINUTES = 5;

/**
 * Periodicaly refresh chronicle analytic stats.
 * @returns The Chronicle analytic stats.
 */
export function useChronicleAnalytics(): { chronicleAnalyticStats: IAnalyticStats | null } {
    const isMounted = useIsMounted();
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
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
                    accountAddressesWithBalance: analyticStats?.accountAddressesWithBalance,
                    lockedStorageDeposit: analyticStats?.lockedStorageDeposit,
                    delegatorsCount: analyticStats?.delegatorsCount,
                });
            } else {
                console.error("[Nova] Chronicle analytics stats refresh failed.");
            }
        }
    };

    return { chronicleAnalyticStats };
}
