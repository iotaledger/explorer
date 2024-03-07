import { OutputMetadataResponse, Output } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { HexHelper } from "~/helpers/stardust/hexHelper";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch output details
 * @param network The Network in context
 * @param outputId The output id
 * @returns The output, metadata, loading bool and error message.
 */
export function useOutputDetails(
    network: string,
    outputId: string | null,
): {
    output: Output | null;
    outputMetadataResponse: OutputMetadataResponse | null;
    isLoading: boolean;
    error: string | null;
} {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [output, setOutput] = useState<Output | null>(null);
    const [metadata, setMetadata] = useState<OutputMetadataResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setOutput(null);
        setMetadata(null);
        if (outputId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .outputDetails({
                        network,
                        outputId: HexHelper.addPrefix(outputId),
                    })
                    .then((response) => {
                        if (isMounted) {
                            const details = response.output;
                            setOutput(details?.output ?? null);
                            setMetadata(details?.metadata ?? null);
                            setError(response.error ?? null);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, outputId]);

    return { output, outputMetadataResponse: metadata, isLoading, error };
}
