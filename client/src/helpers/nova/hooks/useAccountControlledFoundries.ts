import { OutputType, HexEncodedString, FoundryOutput, Utils } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch Foundries controlled by Account address
 * @param network The Network in context
 * @param accountAddress The account address
 * @returns The account foundries and loading bool.
 */
export function useAccountControlledFoundries(network: string, accountAddress: IAddressDetails | null): [string[] | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [accountFoundries, setAccountFoundries] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (accountAddress) {
            const foundries: string[] = [];
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .accountFoundries({
                        network,
                        accountAddress: accountAddress.bech32,
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
                                setAccountFoundries(foundries);
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
    }, [network, accountAddress]);

    const fetchFoundryId = async (outputId: HexEncodedString) => {
        const foundryId = apiClient.outputDetails({ network, outputId }).then((response) => {
            const details = response.output;
            if (accountAddress?.hex && !response.error && details?.output?.type === OutputType.Foundry) {
                const output = details.output as FoundryOutput;
                const serialNumber = output.serialNumber;
                const tokenSchemeType = output.tokenScheme.type;
                const tokenId = Utils.computeTokenId(accountAddress.hex, serialNumber, tokenSchemeType);

                return tokenId;
            }
        });
        return foundryId;
    };

    return [accountFoundries, isLoading];
}
