import { OutputResponse } from "@iota/sdk-wasm-stardust/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { HexHelper } from "~/helpers/stardust/hexHelper";

/**
 * Fetch foundry output details
 * @param network The Network in context
 * @param foundryId The foundry id
 * @returns The output response, loading bool and an error message.
 */
export function useFoundryDetails(network: string, foundryId: string | null): [OutputResponse | null, boolean, string?] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [foundryDetails, setFoundryDetails] = useState<OutputResponse | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (foundryId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .foundryDetails({
                        network,
                        foundryId: HexHelper.addPrefix(foundryId),
                    })
                    .then((response) => {
                        if (isMounted) {
                            setFoundryDetails(response.foundryDetails ?? null);
                            setError(response.error);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, foundryId]);

    return [foundryDetails, isLoading, error];
}
