import { FetchHelper } from "../../helpers/fetchHelper";

interface IIpfsLink {
    Hash: string;
    Name: string;
    Size: number;
    Target: string;
    Type: number;
    Mode?: string;
    Mtime?: number;
    MtimeNsecs?: number;
}

interface IIpfsObject {
    Hash: string;
    Links: IIpfsLink[];
}

interface ILSResponse {
    Objects: IIpfsObject[];
}

interface Mtime {
    secs: number;
    nsecs?: number;
}

interface IIPfsEntry {
    readonly type: "dir" | "file";
    readonly cid: string;
    readonly name: string;
    readonly path: string;
    mode?: number;
    mtime?: Mtime;
    size: number;
}
/**
 * The ipfs endpoint.
 */
const IPFS_ENDPOINT = "https://ipfs.io";

const IPFS_PATH = "/api/v0/ls";

const IPFS_PREFIX = "/ipfs/";

/**
 * Class to handle requests to ipfs.io.
 */
export class IpfsClient {
    public static async ls(path: string): Promise<IIPfsEntry | undefined> {
        let ipfsEntry;
        try {
            const response = await FetchHelper.raw(
                IPFS_ENDPOINT,
                `${IPFS_PATH}?arg=${path}`,
                "get"
            );
            const lsResponse = await response.json() as ILSResponse;
            const result = lsResponse.Objects[0];

            if (result) {
                const links = result.Links;
                if (links.length > 0) {
                    ipfsEntry = IpfsClient.mapLinkToIpfsEntry(links[0], path);
                }
            }
        } catch { }

        return ipfsEntry;
    }

    private static mapLinkToIpfsEntry(link: IIpfsLink, path: string): IIPfsEntry {
        const hash = link.Hash.startsWith(IPFS_PREFIX) ? link.Hash.slice(IPFS_PREFIX.length) : link.Hash;

        const entry: IIPfsEntry = {
            name: link.Name,
            path: path + (link.Name ? `/${link.Name}` : ""),
            size: link.Size,
            cid: hash,
            type: IpfsClient.typeOf(link)
        };

        if (link.Mode) {
            entry.mode = Number.parseInt(link.Mode, 8);
        }

        if (link.Mtime !== undefined && link.Mtime !== null) {
            entry.mtime = {
                secs: link.Mtime
            };

            if (link.MtimeNsecs !== undefined && link.MtimeNsecs !== null) {
                entry.mtime.nsecs = link.MtimeNsecs;
            }
        }

        return entry;
    }

    private static typeOf(link: IIpfsLink) {
        switch (link.Type) {
            case 1:
            case 5: {
                return "dir";
            }
            case 2: {
                return "file";
            }
            default: {
                return "file";
            }
        }
    }
}
