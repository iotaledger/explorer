import { ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch account validator information
 * @param network The Network in context
 * @param accountId The account id
 * @returns The output response and loading bool.
 */
export function useAccountValidatorDetails(
    network: string,
    accountId: string | null,
): { validatorDetails: ValidatorResponse | null; isLoading: boolean } {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [validatorDetails, setValidatorDetails] = useState<ValidatorResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (accountId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .getAccountValidatorDetails({
                        network,
                        accountId,
                    })
                    .then((response) => {
                        if (!response?.error && isMounted) {
                            setValidatorDetails(response.validatorDetails ?? null);
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

    return { validatorDetails, isLoading };
}
