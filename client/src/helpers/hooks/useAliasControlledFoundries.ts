import { FOUNDRY_OUTPUT_TYPE, HexEncodedString, TransactionHelper } from "@iota/iota.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IBech32AddressDetails } from "../../models/api/IBech32AddressDetails";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";

/**
 * Fetch Foundries controlled by Alias address
 * @param network The Network in context
 * @param aliasAddress The alias address
 * @returns The alias foundries and loading bool.
 */
export function useAliasControlledFoundries(network: string, aliasAddress: IBech32AddressDetails | null):
    [
        string[] | null,
        boolean
    ] {
    const isMounted = useIsMounted();
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [aliasFoundries, setAliasFoundries] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (aliasAddress) {
            const foundries: string[] = [];
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.foundriesByAliasAddress({
                    network,
                    aliasAddress: aliasAddress.bech32
                }).then(async foundryOutputs => {
                    if (
                        foundryOutputs?.foundryOutputsResponse &&
                        foundryOutputs?.foundryOutputsResponse?.items.length > 0
                    ) {
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
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, aliasAddress]);

    const fetchFoundryId = async (outputId: HexEncodedString) => {
        const foundryId = tangleCacheService.outputDetails(network, outputId).then(
            response => {
                if (aliasAddress?.hex && !response.error && response.output?.type === FOUNDRY_OUTPUT_TYPE) {
                    const output = response.output;
                    const serialNumber = output.serialNumber;
                    const tokenSchemeType = output.tokenScheme.type;
                    const tokenId = TransactionHelper.constructTokenId(
                        aliasAddress.hex,
                        serialNumber,
                        tokenSchemeType
                    );

                    return tokenId;
                }
            }
        );
        return foundryId;
    };

    return [aliasFoundries, isLoading];
}
