import { OutputTypes, IOutputMetadataResponse } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";

/**
 * Fetch output details
 * @param network The Network in context
 * @param outputId The output id
 * @returns The output, metadata, loading bool and error message.
 */
export function useOutputDetails(network: string, outputId: string | null):
    [
        OutputTypes | null,
        IOutputMetadataResponse | null,
        boolean,
        string?
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [output, setOutput] = useState<OutputTypes | null>(null);
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
                tangleCacheService.outputDetails(
                    network,
                    HexHelper.addPrefix(outputId)
                ).then(response => {
                    if (!response?.error) {
                        setOutput(response.output ?? null);
                        setMetadata(response.metadata ?? null);
                    } else {
                        setError(response.error);
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, outputId]);

    return [output, metadata, isLoading, error];
}

