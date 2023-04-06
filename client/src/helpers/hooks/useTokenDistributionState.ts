import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IRichAddress } from "../../models/api/stardust/chronicle/IRichestAddressesResponse";
import { IDistributionEntry } from "../../models/api/stardust/chronicle/ITokenDistributionResponse";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustApiClient } from "../../services/stardust/stardustApiClient";

/**
 * State holder for Statistics page token distribution section.
 * @param network The Network in context
 * @returns The token distribution state.
 */
export function useTokenDistributionState(network: string): [
    (IRichAddress[] | null),
    (IDistributionEntry[] | null)
] {
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [richestAddresses, setRichestAddresses] = useState<IRichAddress[] | null>(null);
    const [tokenDistribution, setTokenDistribution] = useState<IDistributionEntry[] | null>(null);

    useEffect(() => {
        apiClient.tokenDistribution({ network }).then(response => {
            if (!response.error && response.distribution) {
                setTokenDistribution(response.distribution);
            } else {
                console.log(`Fetching token distribution failed (${network})`, response.error);
            }
        }).catch(e => console.log(`Fetching token distribution failed (${network})`, e));

        apiClient.richestAddresses({ network }).then(response => {
            if (!response.error && response.top) {
                setRichestAddresses(response.top);
            } else {
                console.log(`Fetching richest addresses failed (${network})`, response.error);
            }
        }).catch(e => console.log(`Fetching richest addresses failed (${network})`, e));
    }, [network]);

    return [richestAddresses, tokenDistribution];
}

