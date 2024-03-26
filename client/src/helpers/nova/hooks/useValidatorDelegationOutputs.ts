import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";

/**
 * Fetch delegation outputs this address is delegated to (validator).
 * @param network The Network in context
 * @param addressBech32 The address in bech32 format
 * @returns The output responses and loading bool.
 */
export function useValidatorDelegationOutputs(
    network: string,
    addressBech32: string | null,
): [OutputWithMetadataResponse[] | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [outputs, setOutputs] = useState<OutputWithMetadataResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setOutputs(null);
        if (addressBech32) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .delegationOutputsByValidator({ network, address: addressBech32 })
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
