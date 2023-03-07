import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { TokenRegistryClient } from "../../services/stardust/tokenRegistryClient";

/**
 * Use Token Registry NFT check hook
 * @param network The Network in context
 * @param issuerId The issuer id to check
 * @param nftId The nft id to check
 * @returns The whitelisted boolean.
 */
export function useTokenRegistryNftCheck(network: string, issuerId: string | null, nftId?: string): [
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

