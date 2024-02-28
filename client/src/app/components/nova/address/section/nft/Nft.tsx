import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    isSupportedImageFormat,
    noMetadataPlaceholder,
    nonStandardMetadataPlaceholder,
    unregisteredMetadataPlaceholder,
    unsupportedImageFormatPlaceholderCompact,
    getNftImageContent,
    loadingImagePlaceholderCompact,
} from "./NftMetadataUtils";
import nftSchemeIRC27 from "~assets/schemas/nft-schema-IRC27.json";
import { useNftMetadataUri } from "~helpers/stardust/hooks/useNftMetadataUri";
import { useTokenRegistryNftCheck } from "~helpers/stardust/hooks/useTokenRegistryNftCheck";
import { tryParseMetadata } from "~helpers/stardust/metadataUtils";
import { INftImmutableMetadata } from "~models/api/stardust/nft/INftImmutableMetadata";
import "./Nft.scss";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { MetadataFeature, NftAddress, NftOutput, Utils } from "@iota/sdk-wasm-nova/web";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { TransactionsHelper } from "~/helpers/nova/transactionsHelper";

export interface NftProps {
    /**
     * The nft output.
     */
    nftOutput: NftOutput;
}

const Nft: React.FC<NftProps> = ({ nftOutput }) => {
    const { name: network, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [metadata, setMetadata] = useState<MetadataFeature | null>(null);
    const [issuerId, setIssuerId] = useState<string | null>(null);
    const [standardMetadata, setStandardMetadata] = useState<INftImmutableMetadata | null>();
    const nftAddress = new NftAddress(nftOutput.nftId);
    const nftBech32Address = Utils.addressToBech32(nftAddress, bech32Hrp);
    const [isWhitelisted] = useTokenRegistryNftCheck(issuerId, nftOutput.nftId);
    const [name, setName] = useState<string | null>();
    const [uri, isNftUriLoading] = useNftMetadataUri(standardMetadata?.uri);

    useEffect(() => {
        setName(null);
        if (standardMetadata) {
            setName(standardMetadata.name);
        }
    }, [standardMetadata]);

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

    const unsupportedFormatOrLoading = isNftUriLoading ? loadingImagePlaceholderCompact : unsupportedImageFormatPlaceholderCompact;

    const standardMetadataImageContent = isWhitelisted
        ? standardMetadata && uri && isSupportedImageFormat(standardMetadata.type)
            ? getNftImageContent(standardMetadata.type, uri, "nft-card__image")
            : unsupportedFormatOrLoading
        : unregisteredMetadataPlaceholder;

    const nftImageContent = metadata
        ? standardMetadata
            ? standardMetadataImageContent
            : nonStandardMetadataPlaceholder
        : noMetadataPlaceholder;

    return (
        <div className="nft-card">
            <div className="nft-card__metadata">
                <Link to={`/${network}/addr/${nftBech32Address}`}>{nftImageContent}</Link>
                <span className="nft-card__id">
                    <TruncatedId id={nftOutput.nftId} link={`/${network}/addr/${nftBech32Address}`} />
                </span>
            </div>
            {name && isWhitelisted && <span className="nft-card__name truncate">{name}</span>}
        </div>
    );
};

export default Nft;
