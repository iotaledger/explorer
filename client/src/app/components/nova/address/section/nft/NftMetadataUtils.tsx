import React from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";

export const MESSAGE_NFT_SCHEMA_STANDARD = "The metadata conforms to the IRC27 standard schema! Please consider submitting an entry to the";

export const noMetadataPlaceholder = <ImagePlaceholder message="No metadata" compact />;
export const nonStandardMetadataPlaceholder = <ImagePlaceholder message="Unsupported metadata format" compact />;
export const unsupportedImageFormatPlaceholderCompact = <ImagePlaceholder message="Unsupported image format" compact />;
export const unsupportedImageFormatPlaceholder = <ImagePlaceholder message="Unsupported image format" />;
export const unregisteredMetadataPlaceholder = <ImagePlaceholder message="Unregistered NFT metadata" compact />;
export const loadingImagePlaceholderCompact = <ImagePlaceholder message="Loading image..." color="inherit" isLoading compact />;
export const loadingImagePlaceholder = <ImagePlaceholder message="" color="inherit" isLoading />;

/**
 * Supported image MIME formats.
 */
const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4"]);

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
        <video className={className} src={uri} controls autoPlay muted loop />
    ) : (
        <img className={className} src={uri} alt="nft image" />
    );
}
