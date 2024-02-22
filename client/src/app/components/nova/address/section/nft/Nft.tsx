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
import { INftBase } from "~/models/api/nova/nft/INftBase";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { Utils } from "@iota/sdk-wasm-nova/web";
import TruncatedId from "~/app/components/stardust/TruncatedId";

export interface NftProps {
    /**
     *
     *  NFT
     */
    nft: INftBase;
}

const Nft: React.FC<NftProps> = ({ nft }) => {
    const id = nft.nftId;
    const standardMetadata = nft.metadata ? tryParseMetadata<INftImmutableMetadata>(nft.metadata.entries[0], nftSchemeIRC27) : null;
    const { name: network, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const nftAddress = Utils.hexToBech32(id, bech32Hrp);
    const [isWhitelisted] = useTokenRegistryNftCheck(nft.issuerId, id);
    const [name, setName] = useState<string | null>();
    const [uri, isNftUriLoading] = useNftMetadataUri(standardMetadata?.uri);

    useEffect(() => {
        setName(null);
        if (standardMetadata) {
            setName(standardMetadata.name);
        }
    }, [standardMetadata]);

    const unsupportedFormatOrLoading = isNftUriLoading ? loadingImagePlaceholderCompact : unsupportedImageFormatPlaceholderCompact;

    const standardMetadataImageContent = isWhitelisted
        ? standardMetadata && uri && isSupportedImageFormat(standardMetadata.type)
            ? getNftImageContent(standardMetadata.type, uri, "nft-card__image")
            : unsupportedFormatOrLoading
        : unregisteredMetadataPlaceholder;

    const nftImageContent = nft.metadata
        ? standardMetadata
            ? standardMetadataImageContent
            : nonStandardMetadataPlaceholder
        : noMetadataPlaceholder;

    return (
        <div className="nft-card">
            <div className="nft-card__metadata">
                <Link to={`/${network}/addr/${nftAddress}`}>{nftImageContent}</Link>
                <span className="nft-card__id">
                    <TruncatedId id={id} link={`/${network}/addr/${nftAddress}`} />
                </span>
            </div>
            {name && isWhitelisted && <span className="nft-card__name truncate">{name}</span>}
        </div>
    );
};

export default Nft;
