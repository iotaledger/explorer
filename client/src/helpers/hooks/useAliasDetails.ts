import { AliasOutput } from "@iota/sdk-wasm/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { HexHelper } from "../stardust/hexHelper";

/**
 * Fetch alias output details
 * @param network The Network in context
 * @param aliasId The alias id
 * @returns The output response and loading bool.
 */
export function useAliasDetails(network: string, aliasId: string | null): [AliasOutput | null, boolean] {
    const isMounted = useIsMounted();
    const [aliasOutput, setAliasOutput] = useState<AliasOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (aliasId && isMounted) {
            // eslint-disable-next-line no-void
            void (async () => {
                try {
                    const aliasOutput = await fetchAliasDetailsOutput(network, aliasId);
                    setAliasOutput(aliasOutput);
                } finally {
                    setIsLoading(false);
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, aliasId]);

    return [aliasOutput, isLoading];
}

export const fetchAliasDetailsOutput = async (network: string, aliasId: string | null): Promise<AliasOutput | null> => {
    if (!aliasId) {
        return null;
    }

    const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

    const response = await apiClient.aliasDetails({
        network,
        aliasId: HexHelper.addPrefix(aliasId),
    });

    if (!response?.error) {
        return response.aliasDetails?.output as AliasOutput;
    }

    return null;
};
