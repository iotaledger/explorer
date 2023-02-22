import { HexEncodedString } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import * as jsonschema from "jsonschema";
import React from "react";
import nftSchemeIRC27 from "../../../assets/schemas/nft-schema-IRC27.json";
import { INftImmutableMetadata } from "../../../models/api/stardust/nft/INftImmutableMetadata";
import { ImagePlaceholder } from "./address/ImagePlaceholder";

export const MESSAGE_NFT_SCHEMA_STANDARD =
    "The metadata conforms to the IRC27 standard schema! Please consider submitting an entry to the";

export const noMetadataPlaceholder = <ImagePlaceholder message="No metadata" compact />;
export const nonStandardMetadataPlaceholder = <ImagePlaceholder message="Unsupported metadata format" compact />;
export const unsupportedImageFormatPlaceholder = <ImagePlaceholder message="Unsupported image format" />;
export const unregisteredMetadataPlaceholder = <ImagePlaceholder message="Unregistered NFT metadata" compact />;

/**
 * Tries to parse hex data into NFT immutable metadata (tip-27).
 * @param metadataHex The encoded data.
 * @returns The parsed INftImmutableMetadata or undefined.
 */
export function tryParseNftMetadata(metadataHex: HexEncodedString): INftImmutableMetadata | null {
    const validator = new jsonschema.Validator();
    try {
        const json: unknown = JSON.parse(Converter.hexToUtf8(metadataHex));
        const result = validator.validate(json, nftSchemeIRC27);

        if (result.valid) {
            return json as INftImmutableMetadata;
        }
    } catch { }

    return null;
}

/**
 * Supported image MIME formats.
 */
export const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/gif", "video/mp4"]);

/**
 * Validate NFT image MIME type.
 * @param nftType The NFT image MIME type.
 * @returns A bool.
 */
export function isSupportedImageFormat(nftType: string | undefined): boolean {
    if (nftType === undefined) {
        return false;
    }

    return SUPPORTED_IMAGE_FORMATS.has(nftType);
}

/**
 * Builds the NFT image element depending on content type.
 * @param contentType The NFT image MIME type.
 * @param uri The NFT image URI.
 * @param className The class to use.
 * @returns JSX.
 */
export function getNftImageContent(contentType: string, uri: string, className: string): JSX.Element {
    return contentType === "video/mp4" ? (
        <video
            className={className}
            src={uri}
            controls
            autoPlay
            muted
            loop
        />
    ) : (
        <img
            className={className}
            src={uri}
            alt="nft image"
        />
    );
}

