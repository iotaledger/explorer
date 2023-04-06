import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustApiClient } from "../../services/stardust/stardustApiClient";

/**
 * State holder for Statistics page token distribution section.
 * @param network The Network in context
 * @returns The token distribution state.
 */
export function useTokenDistributionState(network: string) {
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));

    useEffect(() => {
        apiClient.tokenDistribution({ network }).then(response => {
            if (!response.error && response.distribution) {
                console.log("DIST:", response.distribution);
            } else {
                console.log(`Fetching token distribution failed (${network})`, response.error);
            }
        }).catch(e => console.log(`Fetching token distribution failed (${network})`, e));

        apiClient.richestAddresses({ network }).then(response => {
            if (!response.error && response.top) {
                console.log("RICH:", response.top);
            } else {
                console.log(`Fetching richest addresses failed (${network})`, response.error);
            }
        }).catch(e => console.log(`Fetching richest addresses failed (${network})`, e));
    }, [network]);

    return [];
}
