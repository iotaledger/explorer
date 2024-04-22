import { NftAddress } from "@iota/sdk-wasm-stardust/web";
import React, { useContext, useEffect, useState } from "react";
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
import { NftProps } from "./NftProps";
import nftSchemeIRC27 from "~assets/schemas/nft-schema-IRC27.json";
import { useNftMetadataUri } from "~helpers/stardust/hooks/useNftMetadataUri";
import { useTokenRegistryNftCheck } from "~helpers/stardust/hooks/useTokenRegistryNftCheck";
import { Bech32AddressHelper } from "~helpers/stardust/bech32AddressHelper";
import { tryParseMetadata } from "~helpers/stardust/metadataUtils";
import { INftImmutableMetadata } from "~models/api/stardust/nft/INftImmutableMetadata";
import NetworkContext from "../../../../../context/NetworkContext";
import TruncatedId from "../../../TruncatedId";
import "./Nft.scss";

const Nft: React.FC<NftProps> = ({ network, nft }) => {
    const id = nft.nftId;
    const standardMetadata = nft.metadata ? tryParseMetadata<INftImmutableMetadata>(nft.metadata, nftSchemeIRC27) : null;
    const { bech32Hrp } = useContext(NetworkContext);
    const address: NftAddress = new NftAddress(id);
    const nftAddress = Bech32AddressHelper.buildAddress(bech32Hrp, address);
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
                <Link to={`/${network}/addr/${nftAddress.bech32}`}>{nftImageContent}</Link>
                <span className="nft-card__id">
                    <TruncatedId id={id} link={`/${network}/addr/${nftAddress.bech32}`} />
                </span>
            </div>
            {name && isWhitelisted && <span className="nft-card__name truncate">{name}</span>}
        </div>
    );
};

export default Nft;
