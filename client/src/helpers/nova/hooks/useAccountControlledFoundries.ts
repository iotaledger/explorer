import { OutputType, HexEncodedString, FoundryOutput, Utils, OutputResponse } from "@iota/sdk-wasm-nova/web";
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
export function useAccountControlledFoundries(
    network: string,
    accountAddress: IAddressDetails | null,
): [string[] | null, OutputResponse[] | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [accountFoundries, setAccountFoundries] = useState<string[] | null>(null);
    const [accountFoundryOutputs, setAccountFoundryOutputs] = useState<OutputResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (accountAddress) {
            const foundries: string[] = [];
            const outputResponses: OutputResponse[] = [];
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
                                const { outputDetails, foundryId } = await fetchOutputDetailsAndFoundryId(foundryOutputId);
                                if (foundryId) {
                                    foundries.push(foundryId);
                                    outputResponses.push(outputDetails);
                                }
                            }
                            if (isMounted) {
                                setAccountFoundries(foundries);
                                setAccountFoundryOutputs(outputResponses);
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

    const fetchOutputDetailsAndFoundryId = async (outputId: HexEncodedString) => {
        const response = await apiClient.outputDetails({ network, outputId });
        const details = response.output;
        if (accountAddress?.hex && !response.error && details?.output?.type === OutputType.Foundry) {
            const output = details.output as FoundryOutput;
            const serialNumber = output.serialNumber;
            const tokenSchemeType = output.tokenScheme.type;
            const tokenId = Utils.computeTokenId(accountAddress.hex, serialNumber, tokenSchemeType);

            return { outputDetails: details, foundryId: tokenId };
        }
        return { outputDetails: null, foundryId: null };
    };

    return [accountFoundries, accountFoundryOutputs, isLoading];
}
