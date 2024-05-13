import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { IDelegationWithDetails } from "~models/api/nova/IDelegationWithDetails";

/**
 * Fetch Address delegation UTXOs
 * @param network The Network in context
 * @param addressBech32 The address in bech32 format
 * @returns The output responses and loading bool.
 */
export function useAddressDelegationOutputs(network: string, addressBech32: string | null): [IDelegationWithDetails[] | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [outputs, setOutputs] = useState<IDelegationWithDetails[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setOutputs(null);
        if (addressBech32) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .delegationOutputsDetails({ network, address: addressBech32 })
                    .then((response) => {
                        if (!response?.error && response.outputs && isMounted) {
                            setOutputs(response.outputs);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, addressBech32]);

    return [outputs, isLoading];
}
