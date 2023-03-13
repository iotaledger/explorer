import { IOutputResponse } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";

/**
 * Fetch foundry output details
 * @param network The Network in context
 * @param foundryId The foundry id
 * @returns The output response and loading bool.
 */
export function useFoundryDetails(network: string, foundryId: string | null):
    [
        IOutputResponse | null,
        boolean,
        string?
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [foundryDetails, setFoundryDetails] = useState<IOutputResponse | null>(null);
    const [foundryError, setFoundryError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (foundryId) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.foundryDetails({
                    network,
                    foundryId: HexHelper.addPrefix(foundryId)
                }).then(response => {
                    if (!response?.error) {
                        const detials = response.foundryDetails;

                        setFoundryDetails(detials ?? null);
                    } else {
                        setFoundryError(response.error);
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, foundryId]);

    return [foundryDetails, isLoading, foundryError];
}
