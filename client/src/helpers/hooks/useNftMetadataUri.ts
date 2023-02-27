import { useEffect, useState } from "react";
import { getIPFSHash, getIpfsUri } from "../stardust/ipfsHelper";

/**
 * Get the correct nft metadata image uri
 * @param link The image link
 * @returns The uri and loading bool.
 */
export function useNftMetadataUri(link?: string):
    [
        string | undefined,
        boolean
    ] {
    const [uri, setUri] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        const ipfsHash = getIPFSHash(link);
        if (ipfsHash) {
            // eslint-disable-next-line no-void
            void (async () => {
                const ipfsUri = await getIpfsUri({ hash: ipfsHash });
                setUri(ipfsUri);
                setIsLoading(false);
            })();
        } else {
            setUri(link);
            setIsLoading(false);
        }
    }, [link]);

    return [uri, isLoading];
}
