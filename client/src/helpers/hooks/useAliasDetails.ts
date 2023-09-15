import { AliasOutput } from "@iota/iota.js-stardust/web";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustApiClient } from "../../services/stardust/stardustApiClient";
import { useIsMounted } from "./useIsMounted";

/**
 * Fetch alias output details
 * @param network The Network in context
 * @param aliasId The alias id
 * @returns The output response and loading bool.
 */
export function useAliasDetails(network: string, aliasId: string | null):
    [
        AliasOutput | null,
        boolean
    ] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [aliasOutput, setAliasOutput] = useState<AliasOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (aliasId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient.aliasDetails({
                    network,
                    aliasId: HexHelper.addPrefix(aliasId)
                }).then(response => {
                    if (!response?.error && isMounted) {
                        const output = response.aliasDetails?.output as AliasOutput;

                        setAliasOutput(output);
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, aliasId]);

    return [aliasOutput, isLoading];
}
