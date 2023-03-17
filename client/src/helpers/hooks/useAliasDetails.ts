import { IAliasOutput } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";

/**
 * Fetch alias output details
 * @param network The Network in context
 * @param aliasId The alias id
 * @returns The output response and loading bool.
 */
export function useAliasDetails(network: string, aliasId: string | null):
    [
        IAliasOutput | null,
        boolean
    ] {
    const isMounted = useIsMounted();
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [aliasOutput, setAliasOutput] = useState<IAliasOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (aliasId) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.aliasDetails({
                    network,
                    aliasId: HexHelper.addPrefix(aliasId)
                }).then(response => {
                    if (!response?.error && isMounted) {
                        const output = response.aliasDetails?.output as IAliasOutput;

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
