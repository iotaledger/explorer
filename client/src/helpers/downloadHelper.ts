import { Converter } from "@iota/util.js";

/**
 * Class to help with downloading.
 */
export class DownloadHelper {
    /**
     * Get a filename base on the type.
     * @param id The id of the item.
     * @param type The type of the file.
     * @returns The filename.
     */
    public static filename(id: string, type: string): string {
        return `${id}.${type}`;
    }

    /**
     * Create a data url for an object.
     * @param object The object to create the url for.
     * @returns The data url.
     */
    public static createJsonDataUrl(object: unknown): string {
        const b64 = Converter.bytesToBase64(Converter.utf8ToBytes((JSON.stringify(object, undefined, "\t"))));
        return `data:application/json;base64,${b64}`;
    }

    /**
     * Create a data url for binary data.
     * @param data The data to create the url for.
     * @returns The data url.
     */
    public static createBinaryDataUrl(data: Uint8Array): string {
        const b64 = Converter.bytesToBase64(data);
        return `data:application/octet;base64,${b64}`;
    }

    /**
     * Create a data url for hex data.
     * @param data The data to create the url for.
     * @returns The data url.
     */
    public static createHexDataUrl(data: Uint8Array): string {
        const b64 = Converter.bytesToBase64(Converter.utf8ToBytes(Converter.bytesToHex(data)));
        return `data:plain/text;base64,${b64}`;
    }

    /**
     * Create a data url for base64 data.
     * @param data The data to create the url for.
     * @returns The data url.
     */
    public static createBase64DataUrl(data: Uint8Array): string {
        const b64 = Converter.bytesToBase64(Converter.utf8ToBytes(Converter.bytesToBase64(data)));
        return `data:plain/text;base64,${b64}`;
    }
}
