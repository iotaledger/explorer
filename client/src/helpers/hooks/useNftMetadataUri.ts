import { useEffect, useState } from "react";
import { getIPFSHash, getIpfsUri } from "../stardust/ipfsHelper";

export const useNftMetadataUri = (link?: string) => {
    const [uri, setUri] = useState<string | undefined>();

    useEffect(() => {
        const ipfsHash = getIPFSHash(link);
        if (ipfsHash) {
            // eslint-disable-next-line no-void
            void (async () => {
                const ipfsUri = await getIpfsUri({ hash: ipfsHash });
                setUri(ipfsUri);
            })();
        } else {
            setUri(link);
        }
    }, [link]);

    return uri;
};
