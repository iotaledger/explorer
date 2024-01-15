import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { getIPFSHash, getIpfsUri } from "../ipfsHelper";

/**
 * Get the correct nft metadata image uri
 * @param link The image link
 * @returns The uri and loading bool.
 */
export function useNftMetadataUri(link?: string): [string | null, boolean] {
    const isMounted = useIsMounted();
    const [uri, setUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setUri(null);
        const ipfsHash = getIPFSHash(link);
        if (ipfsHash) {
            // eslint-disable-next-line no-void
            void (async () => {
                const ipfsUri = await getIpfsUri({ hash: ipfsHash });
                if (isMounted) {
                    setUri(ipfsUri);
                    setIsLoading(false);
                }
            })();
        } else {
            setUri(link ?? null);
            setIsLoading(false);
        }
    }, [link]);

    return [uri, isLoading];
}
