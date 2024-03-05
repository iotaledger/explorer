import { AnchorOutput, OutputMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { HexHelper } from "~/helpers/stardust/hexHelper";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch anchor output details
 * @param network The Network in context
 * @param anchorID The anchor id
 * @returns The output response and loading bool.
 */
export function useAnchorDetails(
    network: string,
    anchorId: string | null,
): { anchorOutput: AnchorOutput | null; anchorOutputMetadata: OutputMetadataResponse | null; isLoading: boolean } {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [anchorOutput, setAnchorOutput] = useState<AnchorOutput | null>(null);
    const [anchorOutputMetadata, setAnchorOutputMetadata] = useState<OutputMetadataResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (anchorId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .anchorDetails({
                        network,
                        anchorId: HexHelper.addPrefix(anchorId),
                    })
                    .then((response) => {
                        if (!response?.error && isMounted) {
                            const output = response.anchorOutputDetails?.output as AnchorOutput;
                            const metadata = response.anchorOutputDetails?.metadata ?? null;

                            setAnchorOutput(output);
                            setAnchorOutputMetadata(metadata);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, anchorId]);

    return { anchorOutput, anchorOutputMetadata, isLoading };
}
