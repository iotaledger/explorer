import { OutputResponse } from "@iota/sdk-wasm-stardust/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

/**
 * Fetch Address Nft UTXOs
 * @param network The Network in context
 * @param addressBech32 The address in bech32 format
 * @returns The output responses and loading bool.
 */
export function useAddressNftOutputs(network: string, addressBech32: string | null): [OutputResponse[] | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [outputs, setOutputs] = useState<OutputResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setOutputs(null);
        if (addressBech32) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .nftOutputsDetails({ network, address: addressBech32 })
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
