import { useContext, useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import NetworkContext from "~app/context/NetworkContext";
import { ServiceFactory } from "~factories/serviceFactory";
import { TokenRegistryClient } from "~services/stardust/tokenRegistryClient";

/**
 * Use Token Registry NFT check hook
 * @param issuerId The issuer id to check
 * @param nftId The nft id to check
 * @returns The whitelisted boolean.
 */
export function useTokenRegistryNftCheck(issuerId: string | null, nftId?: string): [boolean, boolean] {
    const { name: network } = useContext(NetworkContext);
    const isMounted = useIsMounted();
    const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [client] = useState(ServiceFactory.get<TokenRegistryClient | undefined>("token-registry"));

    useEffect(() => {
        setIsWhitelisted(false);
        setIsChecking(true);
        // eslint-disable-next-line no-void
        void (async () => {
            if (client) {
                const isNftWhitelisted = nftId ? await client.checkNft(network, nftId) : false;
                const isCollectionWhitelisted = issuerId ? await client.checkNft(network, issuerId) : false;
                if (isMounted) {
                    setIsWhitelisted(isNftWhitelisted || isCollectionWhitelisted);
                }
            }
            setIsChecking(false);
        })();
    }, [network, nftId, issuerId]);

    return [isWhitelisted, isChecking];
}
