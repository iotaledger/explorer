import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTokenRegistryNftCheck } from "../../../helpers/hooks/useTokenRegistryNftCheck";
import { tryParseNftMetadata } from "../../../helpers/stardust/valueFormatHelper";
import { INftBase } from "../../../models/api/stardust/nft/INftBase";
import { INftImmutableMetadata } from "../../../models/api/stardust/nft/INftImmutableMetadata";
import DataToggle from "../DataToggle";
import JsonViewer from "../JsonViewer";
import { ImagePlaceholder } from "./address/ImagePlaceholder";
import "./NftMetadataSection.scss";

/**
 * Supported image MIME formats.
 */
const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/gif"]);

const MESSAGE_NFT_SCHEMA_STANDARD =
    "The metadata conforms to the IRC27 standard schema! Please consider submitting an entry to the";

interface NftMetadataSectionProps {
    /**
     * The network in context.
     */
    network: string;

    /**
     * The nft.
     */
    nft: INftBase;
}

const NftMetadataSection: React.FC<NftMetadataSectionProps> = ({ network, nft }) => {
    const [nftMetadata, setNftMetadata] = useState<INftImmutableMetadata | undefined>();
    const [isWhitelisted] = useTokenRegistryNftCheck(network, nft.issuerId, nft.nftId);

    useEffect(() => {
        if (nft.metadata) {
            setNftMetadata(tryParseNftMetadata(nft.metadata));
        }
    }, [nft.metadata]);

    const whitelistedNft = (
        nftMetadata && isWhitelisted ? (
            <div className="section">
                <div className="section--data nft-metadata">
                    {(isSupportedImageFormat(nftMetadata?.type) ? (
                        <img
                            className="nft-metadata__image"
                            src={nftMetadata?.uri}
                            alt="bundle"
                        />
                    ) : (
                        <ImagePlaceholder message="Unsupported image format" />
                    ))}
                    <div className="nft-metadata__info col w100">
                        <ul>
                            <li className="row middle margin-t-t">
                                <span className="label">Name:</span>
                                <span className="value truncate">
                                    {nftMetadata.name}
                                </span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Token Standard:</span>
                                <span className="value truncate">
                                    {nftMetadata.standard}
                                </span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Version:</span>
                                <span className="value truncate">
                                    {nftMetadata.version}
                                </span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Type:</span>
                                <span className="value truncate">
                                    {nftMetadata.type}
                                </span>
                            </li>
                            {
                                nftMetadata.collectionName &&
                                <li className="row margin-t-t">
                                    <span className="label">Collection Name:</span>
                                    <span className="value truncate">
                                        {nftMetadata.collectionName}
                                    </span>
                                </li>
                            }
                            {
                                nftMetadata.issuerName &&
                                <li className="row margin-t-t">
                                    <span className="label">Issuer Name:</span>
                                    <span className="value truncate">
                                        {nftMetadata.issuerName}
                                    </span>
                                </li>
                            }
                        </ul>
                        {
                            nftMetadata.royalties &&
                            <React.Fragment>
                                <h3 className="label margin-t-s">Royalties</h3>
                                <div className="data-toggle margin-t-s">
                                    <div className="data-toggle--content">
                                        <JsonViewer
                                            json={JSON.stringify(nftMetadata.royalties, undefined, "  ")}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        {
                            nftMetadata.attributes &&
                            <React.Fragment>
                                <h3 className="label margin-t-s">Attributes</h3>
                                <div className="data-toggle margin-t-s">
                                    <div className="data-toggle--content">
                                        <JsonViewer
                                            json={JSON.stringify(nftMetadata.attributes, undefined, "  ")}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        {
                            nftMetadata.description &&
                            <React.Fragment>
                                <h2 className="label margin-t-s">Description</h2>
                                <span className="value margin-t-t">
                                    {nftMetadata.description}
                                </span>
                            </React.Fragment>
                        }
                    </div>
                </div>
            </div>
        ) : null
    );

    const notWhitelistedIRC27 = (
        nftMetadata && !isWhitelisted ? (
            <div className="section">
                <div className="section--data">
                    <p className="value margin-b-t">
                        {MESSAGE_NFT_SCHEMA_STANDARD}&nbsp;
                        <Link
                            className="value highlight"
                            to={{ pathname: "https://github.com/iota-community/token-whitelist" }}
                            target="_blank"
                        >
                            Token Registry.
                        </Link>
                    </p>
                    <DataToggle sourceData={nft.metadata ?? ""} withSpacedHex={true} />
                </div>
            </div>
        ) : null
    );

    const notIRC27Metadata = (
        <div className="section">
            <div className="section--data">
                <DataToggle sourceData={nft.metadata ?? ""} withSpacedHex={true} />
            </div>
        </div>
    );

    const noMetadata = (
        <div className="section">
            <div className="section--data">
                <p>
                    There is no metadata for this Nft.
                </p>
            </div>
        </div>
    );

    if (nft.metadata) {
        if (whitelistedNft) {
            return whitelistedNft;
        }
        if (notWhitelistedIRC27) {
            return notWhitelistedIRC27;
        }
        if (notIRC27Metadata) {
            return notIRC27Metadata;
        }
    }
    return noMetadata;
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

export default NftMetadataSection;
