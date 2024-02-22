import { CongestionResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch account congestion
 * @param network The Network in context
 * @param accountId The account id
 * @returns The output response and loading bool.
 */
export function useAccountCongestion(
    network: string,
    accountId: string | null,
): { congestion: CongestionResponse | null; isLoading: boolean } {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [congestion, setAccountCongestion] = useState<CongestionResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (accountId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .getAccountCongestion({
                        network,
                        accountId,
                    })
                    .then((response) => {
                        if (!response?.error && isMounted) {
                            setAccountCongestion(response.congestion ?? null);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, accountId]);

    return { congestion, isLoading };
}
