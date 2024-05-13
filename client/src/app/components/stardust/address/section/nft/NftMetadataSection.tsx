import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getNftImageContent,
    isSupportedImageFormat,
    loadingImagePlaceholder,
    MESSAGE_NFT_SCHEMA_STANDARD,
    unsupportedImageFormatPlaceholder,
} from "./NftMetadataUtils";
import nftSchemeIRC27 from "~assets/schemas/nft-schema-IRC27.json";
import { useNftMetadataUri } from "~helpers/stardust/hooks/useNftMetadataUri";
import { useTokenRegistryNftCheck } from "~helpers/stardust/hooks/useTokenRegistryNftCheck";
import { tryParseMetadata } from "~helpers/stardust/metadataUtils";
import { INftBase } from "~models/api/stardust/nft/INftBase";
import { INftImmutableMetadata } from "~models/api/stardust/nft/INftImmutableMetadata";
import DataToggle from "../../../../DataToggle";
import JsonViewer from "../../../../JsonViewer";
import TruncatedId from "../../../TruncatedId";
import "./NftMetadataSection.scss";

interface NftMetadataSectionProps {
    /**
     * The network in context.
     */
    readonly network: string;

    /**
     * The nft.
     */
    readonly nft: INftBase;

    /**
     * Is nft output loading.
     */
    readonly isLoading: boolean;
}

const NftMetadataSection: React.FC<NftMetadataSectionProps> = ({ network, nft, isLoading }) => {
    const [standardMetadata, setStandardMetadata] = useState<INftImmutableMetadata | null>();
    const [isWhitelisted, isChecking] = useTokenRegistryNftCheck(nft.issuerId, nft.nftId);
    const [uri, isNftUriLoading] = useNftMetadataUri(standardMetadata?.uri);

    useEffect(() => {
        if (nft.metadata) {
            setStandardMetadata(tryParseMetadata<INftImmutableMetadata>(nft.metadata, nftSchemeIRC27));
        }
    }, [nft.metadata]);

    const unsupportedFormatOrLoading = isNftUriLoading ? loadingImagePlaceholder : unsupportedImageFormatPlaceholder;

    const whitelistedNft =
        standardMetadata && isWhitelisted ? (
            <div className="section">
                <div className="section--data nft-metadata">
                    {uri && isSupportedImageFormat(standardMetadata?.type)
                        ? getNftImageContent(standardMetadata.type, uri, "nft-metadata__image")
                        : unsupportedFormatOrLoading}
                    <div className="nft-metadata__info col w100">
                        <ul>
                            <li className="row middle margin-t-t">
                                <span className="label">Name:</span>
                                <span className="value truncate">{standardMetadata.name}</span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Token Standard:</span>
                                <span className="value truncate">{standardMetadata.standard}</span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Version:</span>
                                <span className="value truncate">{standardMetadata.version}</span>
                            </li>
                            <li className="row margin-t-t">
                                <span className="label">Type:</span>
                                <span className="value truncate">{standardMetadata.type}</span>
                            </li>
                            {standardMetadata.collectionName && (
                                <li className="row margin-t-t">
                                    <span className="label">Collection Name:</span>
                                    <span className="value truncate">{standardMetadata.collectionName}</span>
                                </li>
                            )}
                            {nft.issuerId && (
                                <li className="row margin-t-t">
                                    <span className="label">Issuer Id:</span>
                                    <span className="value truncate">
                                        <TruncatedId id={nft.issuerId} link={`/${network}/search/${nft.issuerId}`} showCopyButton />
                                    </span>
                                </li>
                            )}
                            {standardMetadata.issuerName && (
                                <li className="row margin-t-t">
                                    <span className="label">Issuer Name:</span>
                                    <span className="value truncate">{standardMetadata.issuerName}</span>
                                </li>
                            )}
                        </ul>
                        {standardMetadata.royalties && (
                            <React.Fragment>
                                <h3 className="label margin-t-s">Royalties</h3>
                                <div className="data-toggle margin-t-s">
                                    <div className="data-toggle--content">
                                        <JsonViewer json={JSON.stringify(standardMetadata.royalties, undefined, "  ")} />
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {standardMetadata.attributes && (
                            <React.Fragment>
                                <h3 className="label margin-t-s">Attributes</h3>
                                <div className="data-toggle margin-t-s">
                                    <div className="data-toggle--content">
                                        <JsonViewer json={JSON.stringify(standardMetadata.attributes, undefined, "  ")} />
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {standardMetadata.description && (
                            <React.Fragment>
                                <h2 className="label margin-t-s">Description</h2>
                                <span className="value margin-t-t nft-metadata__info__description">{standardMetadata.description}</span>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        ) : null;

    const notWhitelistedIRC27 =
        standardMetadata && !isWhitelisted ? (
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
        ) : null;

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
                <p>There is no metadata for this Nft.</p>
            </div>
        </div>
    );

    if (isLoading) {
        return null;
    }

    if (nft.metadata && !isChecking) {
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

export default NftMetadataSection;
