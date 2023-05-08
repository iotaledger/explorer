import { IpfsClient } from "../../services/stardust/ipfsClient";
/**
 * The ipfs endpoint.
 */
const IPFS_ENDPOINT = "https://ipfs.io";

const IPFS_PATH = "/ipfs/";

interface IpfsLink {
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
    let ipfsLink = `${IPFS_PATH}${link.hash}${link.path ?? ""}`;

    try {
        const ipfsEntry = await IpfsClient.ls(ipfsLink);

        if (ipfsEntry) {
            if (ipfsEntry.type === "dir") {
                const path = `${link.path ?? ""}/${ipfsEntry.name}`;
                return await getIpfsUri({ hash: link.hash, path });
            }
            ipfsLink = `${ipfsLink}/${encodeURIComponent(ipfsEntry.name)}`;
        }
    } catch { }

    return `${IPFS_ENDPOINT}${ipfsLink}`;
}

