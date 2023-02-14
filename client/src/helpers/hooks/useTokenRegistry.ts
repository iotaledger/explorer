import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { TokenRegistryClient } from "../../services/stardust/tokenRegistryClient";

/**
 * Use Token Registry hook
 * @param network The Network in context
 * @param nftId The nft id to check
 * @param issuerId The issuer id to check
 * @returns The whitelisted boolean.
 */
export function useTokenRegistry(network: string, nftId?: string, issuerId?: string): [
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
                const isNftWhitelisted = nftId ? await client.checkNft(network, nftId) : false;
                const isCollectionWhitelisted = issuerId ? await client.checkNft(network, issuerId) : false;

                setIsWhitelisted(isNftWhitelisted || isCollectionWhitelisted);
            }
        })();
    }, [network, nftId, issuerId]);

    return [isWhitelisted];
}

