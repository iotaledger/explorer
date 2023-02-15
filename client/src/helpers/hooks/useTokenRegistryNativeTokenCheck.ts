import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { TokenRegistryClient } from "../../services/stardust/tokenRegistryClient";

/**
 * Use Token Registry Native Tokens check hook
 * @param network The Network in context
 * @param tokenId The token id to check
 * @returns The whitelisted boolean.
 */
export function useTokenRegistryNativeTokenCheck(network: string, tokenId: string | null): [
    boolean
] {
    const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
    const [client] = useState(
        ServiceFactory.get<TokenRegistryClient | undefined>("token-registry")
    );

    useEffect(() => {
        setIsWhitelisted(false);
        // eslint-disable-next-line no-void
        void (async () => {
            if (client) {
                const isTokenWhitelisted = tokenId ? await client.checkNativeToken(network, tokenId) : false;

                setIsWhitelisted(isTokenWhitelisted);
            }
        })();
    }, [network, tokenId]);

    return [isWhitelisted];
}

