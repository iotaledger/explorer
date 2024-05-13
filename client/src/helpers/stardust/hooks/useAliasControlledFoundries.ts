import { OutputType, HexEncodedString, FoundryOutput, Utils } from "@iota/sdk-wasm-stardust/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { IBech32AddressDetails } from "~models/api/IBech32AddressDetails";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

/**
 * Fetch Foundries controlled by Alias address
 * @param network The Network in context
 * @param aliasAddress The alias address
 * @returns The alias foundries and loading bool.
 */
export function useAliasControlledFoundries(network: string, aliasAddress: IBech32AddressDetails | null): [string[] | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [aliasFoundries, setAliasFoundries] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (aliasAddress) {
            const foundries: string[] = [];
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .aliasFoundries({
                        network,
                        aliasAddress: aliasAddress.bech32,
                    })
                    .then(async (foundryOutputs) => {
                        if (foundryOutputs?.foundryOutputsResponse && foundryOutputs?.foundryOutputsResponse?.items.length > 0) {
                            for (const foundryOutputId of foundryOutputs.foundryOutputsResponse.items) {
                                const foundryId = await fetchFoundryId(foundryOutputId);
                                if (foundryId) {
                                    foundries.push(foundryId);
                                }
                            }
                            if (isMounted) {
                                setAliasFoundries(foundries);
                            }
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, aliasAddress]);

    const fetchFoundryId = async (outputId: HexEncodedString) => {
        const foundryId = apiClient.outputDetails({ network, outputId }).then((response) => {
            const details = response.output;
            if (aliasAddress?.hex && !response.error && details?.output?.type === OutputType.Foundry) {
                const output = details.output as FoundryOutput;
                const serialNumber = output.serialNumber;
                const tokenSchemeType = output.tokenScheme.type;
                const tokenId = Utils.computeTokenId(aliasAddress.hex, serialNumber, tokenSchemeType);

                return tokenId;
            }
        });
        return foundryId;
    };

    return [aliasFoundries, isLoading];
}
