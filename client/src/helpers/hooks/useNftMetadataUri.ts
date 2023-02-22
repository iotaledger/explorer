import { useEffect, useState } from "react";
import { getIPFSHash, getIpfsLink } from "../stardust/ipfsHelper";

export const useNftMetadataUri = (uri?: string) => {
    const [link, setLink] = useState<string | undefined>();

    useEffect(() => {
        const ipfsHash = getIPFSHash(uri);
        if (ipfsHash) {
            // eslint-disable-next-line no-void
            void (async () => {
                const ipfsLink = await getIpfsLink(ipfsHash);
                setLink(ipfsLink);
            })();
        } else {
            setLink(uri);
        }
    }, [uri]);

    return link;
};
