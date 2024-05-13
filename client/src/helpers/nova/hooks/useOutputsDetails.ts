import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~services/nova/novaApiClient";
import { HexHelper } from "~helpers/stardust/hexHelper";

interface IOutputDetails {
    outputDetails: OutputWithMetadataResponse;
    outputId: string;
}

/**
 * Fetch outputs details
 * @param network The Network in context
 * @param outputIds The output ids
 * @returns The outputs responses, loading bool and an error message.
 */
export function useOutputsDetails(network: string, outputIds: string[] | null): [IOutputDetails[], boolean, string?] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [outputs, setOutputs] = useState<IOutputDetails[]>([]);
    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (outputIds) {
            const promises: Promise<void>[] = [];
            const items: IOutputDetails[] = [];

            for (const outputId of outputIds) {
                const promise = apiClient
                    .outputDetails({
                        network,
                        outputId: HexHelper.addPrefix(outputId),
                    })
                    .then((response) => {
                        const details = response.output;
                        if (!response?.error && details?.output && details?.metadata) {
                            const fetchedOutputDetails = {
                                output: details.output,
                                metadata: details.metadata,
                                outputIdProof: details.outputIdProof,
                            };
                            const item: IOutputDetails = {
                                outputDetails: fetchedOutputDetails,
                                outputId,
                            };
                            items.push(item);
                        } else {
                            setError(response.error);
                        }
                    })
                    .catch((e) => console.error(e));

                promises.push(promise);
            }

            Promise.allSettled(promises)
                .then((_) => {
                    if (isMounted) {
                        setOutputs(items);
                    }
                })
                .catch((_) => {
                    setError("Failed loading output details!");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [network, outputIds]);
    return [outputs, isLoading, error];
}
