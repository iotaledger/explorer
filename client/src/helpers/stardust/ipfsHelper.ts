// eslint-disable-next-line import/no-unresolved
import { create } from "ipfs-http-client";

/**
 * The ipfs endpoint.
 */
const IPFS_ENDPOINT = "https://ipfs.io";

/**
 * Get hash from ipfs link.
 * @param url The url to check.
 * @returns Is ipfs link.
 */
export function getIPFSHash(url?: string): string | undefined {
    const ipfsPrefix = "ipfs://";

    if (url?.startsWith(ipfsPrefix)) {
      return url.slice(ipfsPrefix.length);
    }
}

/**
 * Checks if provided hash is an ipfs folder or file.
 * @param hash The ipfs hash.
 * @returns Path to a file.
 */
export async function getIpfsLink(hash: string): Promise<string | undefined> {
    const ipfs = create({ url: IPFS_ENDPOINT });
    const link = `${IPFS_ENDPOINT}/ipfs/${hash}`;
    try {
        const content = ipfs.cat(`/ipfs/${hash}`);

        if (typeof content === "object") {
            // Content is a folder, get the first file
            for await (const file of ipfs.ls(`/ipfs/${hash}`)) {
                if (file.type === "file") {
                    return `${IPFS_ENDPOINT}/${file.path}`;
                }
            }
        } else {
            return link;
        }
    } catch {
        return link;
    }
}
