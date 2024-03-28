import { Output, IOutputMetadataResponse } from "@iota/sdk-wasm-stardust/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { HexHelper } from "~helpers/stardust/hexHelper";

/**
 * Fetch output details
 * @param network The Network in context
 * @param outputId The output id
 * @returns The output, metadata, loading bool and error message.
 */
export function useOutputDetails(
    network: string,
    outputId: string | null,
): [Output | null, IOutputMetadataResponse | null, boolean, string?] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [output, setOutput] = useState<Output | null>(null);
    const [metadata, setMetadata] = useState<IOutputMetadataResponse | null>(null);
    const [error, setError] = useState<string>();
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
                            setError(response.error);
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

    return [output, metadata, isLoading, error];
}
