import { IOutputResponse } from "@iota/iota.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";

/**
 * Fetch Address basic UTXOs
 * @param network The Network in context
 * @param addressBech32 The address in bech32 format
 * @returns The output responses and loading bool.
 */
export function useAddressBasicOutputs(network: string, addressBech32?: string): [IOutputResponse[] | null, boolean] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [outputs, setOutputs] = useState<IOutputResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setOutputs(null);
        if (addressBech32) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.addressBasicOutputs(network, addressBech32).then(response => {
                    if (!response?.error && response.outputs) {
                        setOutputs(response.outputs);
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, addressBech32]);

    return [outputs, isLoading];
}

