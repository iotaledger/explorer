import React from "react";
import { Link } from "react-router-dom";
import metadataMissingPlaceholder from "../../../assets/stardust/missing-nft-metadata.png";
import unsupportedFormatPlaceholder from "../../../assets/stardust/unsupported-format.png";
import { NftProps } from "./NftProps";
import TruncatedId from "./TruncatedId";
import "./Nft.scss";

/**
 * Supported image MIME formats.
 */
const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/gif"]);

const Nft: React.FC<NftProps> = ({ id, network, metadata }) => {
    const nftImage = !metadata ? (
        <img
            className="nft-metadata__image"
            src={metadataMissingPlaceholder}
        />
    ) : (isSupportedImageFormat(metadata.type) ? (
        <img
            className="nft-metadata__image"
            src={metadata?.uri}
            alt="bundle"
        />
    ) : (
        <img
            className="nft-metadata__image"
            src={unsupportedFormatPlaceholder}
        />
    ));

    return (
        <div className="nft-card">
            <div className="nft-card__nft-metadata">
                <Link
                    to={`/${network}/nft-registry/${id}`}
                >
                    {nftImage}
                </Link>
                {metadata?.name && <span className="nft-metadata__name">{metadata.name}</span>}
            </div>
            <span className="nft-card__nft-id">
                <Link to={`/${network}/nft-registry/${id}`} className="margin-r-t" >
                    <TruncatedId id={id} />
                </Link>
            </span>
        </div>
    );
};

/**
 * Validate NFT image MIME type.
 * @param nftType The NFT image MIME type.
 * @returns A bool.
 */
function isSupportedImageFormat(nftType: string | undefined): boolean {
    if (nftType === undefined) {
        return false;
    }

    return SUPPORTED_IMAGE_FORMATS.has(nftType);
}

export default Nft;
