import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { IValidatorStatsResponse } from "~/models/api/nova/IValidatorStatsResponse";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { useNetworkInfoNova } from "../networkInfo";

export function useValidatorStats(): { validatorStats: IValidatorStatsResponse | null; error: string | null } {
    const isMounted = useIsMounted();
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [validatorStats, setValidatorStats] = useState<IValidatorStatsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const validatorStatsResponse = await apiClient.getValidatorStats({ network });

            if (isMounted) {
                if (validatorStatsResponse.error) {
                    setError(validatorStatsResponse.error);
                } else {
                    setValidatorStats(validatorStatsResponse);
                }
            }
        })();
    }, [network]);

    return { validatorStats, error };
}
