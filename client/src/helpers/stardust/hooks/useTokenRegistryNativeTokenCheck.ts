import { useContext, useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import NetworkContext from "~app/context/NetworkContext";
import { ServiceFactory } from "~factories/serviceFactory";
import { TokenRegistryClient } from "~services/stardust/tokenRegistryClient";

/**
 * Use Token Registry Native Tokens check hook
 * @param tokenId The token id to check
 * @returns The whitelisted boolean.
 */
export function useTokenRegistryNativeTokenCheck(tokenId: string | null): [boolean] {
    const { name: network } = useContext(NetworkContext);
    const isMounted = useIsMounted();
    const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
    const [client] = useState(ServiceFactory.get<TokenRegistryClient | undefined>("token-registry"));

    useEffect(() => {
        setIsWhitelisted(false);
        // eslint-disable-next-line no-void
        void (async () => {
            if (client) {
                const isTokenWhitelisted = tokenId ? await client.checkNativeToken(network, tokenId) : false;

                if (isMounted) {
                    setIsWhitelisted(isTokenWhitelisted);
                }
            }
        })();
    }, [network, tokenId]);

    return [isWhitelisted];
}
