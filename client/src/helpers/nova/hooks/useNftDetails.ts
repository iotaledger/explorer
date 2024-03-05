import { OutputMetadataResponse, NftOutput } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { HexHelper } from "~/helpers/stardust/hexHelper";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch nft output details
 * @param network The Network in context
 * @param nftID The nft id
 * @returns The output response and loading bool.
 */
export function useNftDetails(
    network: string,
    nftId: string | null,
): { nftOutput: NftOutput | null; nftOutputMetadata: OutputMetadataResponse | null; isLoading: boolean } {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [nftOutput, setNftOutput] = useState<NftOutput | null>(null);
    const [nftOutputMetadata, setNftOutputMetadata] = useState<OutputMetadataResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (nftId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .nftDetails({
                        network,
                        nftId: HexHelper.addPrefix(nftId),
                    })
                    .then((response) => {
                        if (!response?.error && isMounted) {
                            const output = response.nftOutputDetails?.output as NftOutput;
                            const metadata = response.nftOutputDetails?.metadata ?? null;

                            setNftOutput(output);
                            setNftOutputMetadata(metadata);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, nftId]);

    return { nftOutput, nftOutputMetadata, isLoading };
}
