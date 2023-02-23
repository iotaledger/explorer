// eslint-disable-next-line import/no-unresolved
import { create } from "ipfs-http-client";

/**
 * The ipfs endpoint.
 */
const IPFS_ENDPOINT = "https://ipfs.io";

const IPFS_PATH = "/ipfs/";

export interface IpfsLink {
  path?: string;
  hash: string;
}
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
 * Get the file uri for ipfs link.
 * @param link The ipfs link.
 * @returns Path to a file.
 */
export async function getIpfsUri(link: IpfsLink): Promise<string> {
    const ipfsClient = create({ url: IPFS_ENDPOINT });
    let ipfsLink = `${IPFS_PATH}${link.hash}${link.path ?? ""}`;

    try {
        const ipfsContent = ipfsClient.ls(ipfsLink);
        const iterator = ipfsContent[Symbol.asyncIterator]();
        const ipfsEntry = await iterator.next();

        if (!ipfsEntry.done) {
            if (ipfsEntry.value.type === "dir") {
                const path = `${link.path ?? ""}/${ipfsEntry.value.name}`;
                return await getIpfsUri({ hash: link.hash, path });
            }
            ipfsLink = `${ipfsLink}/${encodeURIComponent(ipfsEntry.value.name)}`;
        }
    } catch { }

    return `${IPFS_ENDPOINT}${ipfsLink}`;
}
