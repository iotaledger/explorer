import { HexEncodedString } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import * as jsonschema from "jsonschema";
import nftSchemeIRC27 from "../../assets/schemas/nft-schema-IRC27.json";

export interface INftImmutableMetadata {
    standard: "IRC27";
    version: string;
    type: string;
    uri: string;
    name: string;
    collectionName?: string;
    royalities?: Record<string, unknown>;
    issuerName?: string;
    description?: string;
    attributes?: [];
    error?: string;
}

export interface INftBase {
    id: string;
    metadata?: INftImmutableMetadata;
}

/**
 * Tries to parse hex data into NFT immutable metadata (tip-27).
 * @param metadataHex The encoded data.
 * @returns The parsed INftImmutableMetadata or undefined.
 */
export function tryParseNftMetadata(metadataHex: HexEncodedString): INftImmutableMetadata | undefined {
    const validator = new jsonschema.Validator();
    try {
        const json: unknown = JSON.parse(Converter.hexToUtf8(metadataHex));
        const result = validator.validate(json, nftSchemeIRC27);

        if (result.valid) {
            return json as INftImmutableMetadata;
        }
    } catch { }
}
