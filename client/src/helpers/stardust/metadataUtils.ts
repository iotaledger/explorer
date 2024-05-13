import { HexEncodedString, hexToUtf8 } from "@iota/sdk-wasm-stardust/web";
import * as jsonschema from "jsonschema";
/**
 * Tries to parse hex data into metadata.
 * @param metadataHex The encoded data.
 * @param schema The json schema to validate aginst.
 * @returns The parsed metadata or undefined.
 */
export function tryParseMetadata<S>(metadataHex: HexEncodedString, schema: jsonschema.Schema): S | null {
    const validator = new jsonschema.Validator();
    try {
        const json: unknown = JSON.parse(hexToUtf8(metadataHex));
        const result = validator.validate(json, schema);

        if (result.valid) {
            return json as S;
        }
    } catch {}

    return null;
}
