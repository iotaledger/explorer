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
import { INftImmutableMetadata } from "~models/api/stardust/nft/INftImmutableMetadata";

import "./NftMetadataSection.scss";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import JsonViewer from "~/app/components/JsonViewer";
import DataToggle from "~/app/components/DataToggle";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { MetadataFeature, NftOutput } from "@iota/sdk-wasm-nova/web";
import { TransactionsHelper } from "~/helpers/nova/transactionsHelper";

interface NftMetadataSectionProps {
    /**
     * The nft output.
     */
    readonly nftOutput: NftOutput | null;
}

const NftMetadataSection: React.FC<NftMetadataSectionProps> = ({ nftOutput }) => {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [metadata, setMetadata] = useState<MetadataFeature | null>(null);
    const [issuerId, setIssuerId] = useState<string | null>(null);
    const [standardMetadata, setStandardMetadata] = useState<INftImmutableMetadata | null>();
    const [isWhitelisted, isChecking] = useTokenRegistryNftCheck(issuerId, nftOutput?.nftId);
    const [uri, isNftUriLoading] = useNftMetadataUri(standardMetadata?.uri);

    useEffect(() => {
        if (nftOutput) {
            const nftMetadata = TransactionsHelper.getNftMetadataFeature(nftOutput);
            const nftIssuerId = TransactionsHelper.getNftIssuerId(nftOutput);
            if (nftMetadata) {
                setMetadata(nftMetadata);
                setStandardMetadata(tryParseMetadata<INftImmutableMetadata>(Object.values(nftMetadata.entries)[0], nftSchemeIRC27));
            }
            if (metadata) {
                setIssuerId(nftIssuerId);
            }
        }
    }, [nftOutput]);

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
                            {issuerId && (
                                <li className="row margin-t-t">
                                    <span className="label">Issuer Id:</span>
                                    <span className="value truncate">
                                        <TruncatedId id={issuerId} link={`/${network}/search/${issuerId}`} showCopyButton />
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
                    <DataToggle sourceData={metadata?.toString() ?? ""} withSpacedHex={true} />
                </div>
            </div>
        ) : null;

    const notIRC27Metadata = (
        <div className="section">
            <div className="section--data">
                <DataToggle sourceData={metadata?.toString() ?? ""} withSpacedHex={true} />
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

    if (metadata && !isChecking) {
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
