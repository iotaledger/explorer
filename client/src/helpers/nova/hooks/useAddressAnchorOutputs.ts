import { OutputResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch Address anchor UTXOs
 * @param network The Network in context
 * @param addressBech32 The address in bech32 format
 * @returns The output responses and loading bool.
 */
export function useAddressAnchorOutputs(network: string, addressBech32: string | null): [OutputResponse[] | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [outputs, setOutputs] = useState<OutputResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setOutputs(null);
        if (addressBech32) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .basicOutputsDetails({ network, address: addressBech32 })
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
