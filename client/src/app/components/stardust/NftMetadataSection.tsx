import React from "react";
import metadataMissingPlaceholder from "../../../assets/stardust/missing-nft-metadata.png";
import unsupportedFormatPlaceholder from "../../../assets/stardust/unsupported-format.png";
import { INftImmutableMetadata } from "../../../models/api/stardust/nft/INftImmutableMetadata";
import JsonViewer from "../JsonViewer";
import "./NftMetadataSection.scss";

/**
 * Supported image MIME formats.
 */
const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/gif"]);

interface NftMetadataSectionProps {
    /**
     * NFT Metadata
     */
    metadata?: INftImmutableMetadata;
}

const NftMetadataSection: React.FC<NftMetadataSectionProps> = ({ metadata }) => {
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
        (metadata ? (
            <div className="section">
                <div className="section--data nft-metadata">
                    {nftImage}
                    <div className="nft-metadata__info col w100">
                        <ul>
                            <li className="row middle margin-t-t">
                                <span className="label">Name:</span>
                                <span className="value truncate">
                                    {metadata.name}
                                </span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Token Standard:</span>
                                <span className="value truncate">
                                    {metadata.standard}
                                </span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Version:</span>
                                <span className="value truncate">
                                    {metadata.version}
                                </span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Type:</span>
                                <span className="value truncate">
                                    {metadata.type}
                                </span>
                            </li>
                            {
                                metadata.collectionName &&
                                <li className="row margin-t-t">
                                    <span className="label">Collection Name:</span>
                                    <span className="value truncate">
                                        {metadata.collectionName}
                                    </span>
                                </li>
                            }
                            {
                                metadata.issuerName &&
                                <li className="row margin-t-t">
                                    <span className="label">Issuer Name:</span>
                                    <span className="value truncate">
                                        {metadata.issuerName}
                                    </span>
                                </li>
                            }
                        </ul>
                        {
                            metadata.royalties &&
                            <React.Fragment>
                                <h3 className="label margin-t-s">Royalties</h3>
                                <div className="data-toggle margin-t-s">
                                    <div className="data-toggle--content">
                                        <JsonViewer
                                            json={JSON.stringify(metadata.royalties, undefined, "  ")}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        {
                            metadata.attributes &&
                            <React.Fragment>
                                <h3 className="label margin-t-s">Attributes</h3>
                                <div className="data-toggle margin-t-s">
                                    <div className="data-toggle--content">
                                        <JsonViewer
                                            json={JSON.stringify(metadata.attributes, undefined, "  ")}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        {
                            metadata.description &&
                            <React.Fragment>
                                <h2 className="label margin-t-s">Description</h2>
                                <span className="value margin-t-t">
                                    {metadata.description}
                                </span>
                            </React.Fragment>
                        }
                    </div>
                </div>
            </div>
        ) : null
        )
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

NftMetadataSection.defaultProps = {
    metadata: undefined
};

export default NftMetadataSection;
