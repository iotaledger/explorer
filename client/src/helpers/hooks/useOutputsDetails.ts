import { IOutputResponse } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";

interface IOutputDetails {
    outputDetails: IOutputResponse;
    outputId: string;
}

/**
 * Fetch outputs details
 * @param network The Network in context
 * @param outputIds The output ids
 * @returns The outputs responses, loading bool and an error message.
 */
export function useOutputsDetails(network: string, outputIds: string[] | null):
    [
        IOutputDetails[],
        boolean,
        string?
    ] {
    const isMounted = useIsMounted();
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [outputs, setOutputs] = useState<IOutputDetails[]>([]);
    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (outputIds) {
            const promises: Promise<void>[] = [];
            const items: IOutputDetails[] = [];

            for (const outputId of outputIds) {
                const promise = tangleCacheService.outputDetails(
                    network,
                    HexHelper.addPrefix(outputId)
                ).then(response => {
                    if (!response?.error && response.output && response.metadata) {
                        const fetchedOutputDetails = {
                            output: response.output,
                            metadata: response.metadata
                        };
                        const item: IOutputDetails = {
                            outputDetails: fetchedOutputDetails,
                            outputId
                        };
                        items.push(item);
                    } else {
                        setError(response.error);
                    }
                }).catch(e => console.log(e));

                promises.push(promise);
            }

            Promise.allSettled(promises)
                .then(_ => {
                    if (isMounted) {
                        setOutputs(items);
                    }
                }).catch(_ => {
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
