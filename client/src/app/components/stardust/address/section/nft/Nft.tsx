import { INftAddress, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNftMetadataUri } from "../../../../../../helpers/hooks/useNftMetadataUri";
import { useTokenRegistryNftCheck } from "../../../../../../helpers/hooks/useTokenRegistryNftCheck";
import { Bech32AddressHelper } from "../../../../../../helpers/stardust/bech32AddressHelper";
import NetworkContext from "../../../../../context/NetworkContext";
import TruncatedId from "../../../TruncatedId";
import {
    isSupportedImageFormat, tryParseNftMetadata, noMetadataPlaceholder,
    nonStandardMetadataPlaceholder, unregisteredMetadataPlaceholder,
    unsupportedImageFormatPlaceholderCompact, getNftImageContent, loadingImagePlaceholderCompact
} from "./NftMetadataUtils";
import { NftProps } from "./NftProps";
import "./Nft.scss";

const Nft: React.FC<NftProps> = ({ network, nft }) => {
    const id = nft.nftId;
    const standardMetadata = nft.metadata ? tryParseNftMetadata(nft.metadata) : null;
    const { bech32Hrp } = useContext(NetworkContext);
    const address: INftAddress = { type: NFT_ADDRESS_TYPE, nftId: id };
    const nftAddress = Bech32AddressHelper.buildAddress(bech32Hrp, address);
    const [isWhitelisted] = useTokenRegistryNftCheck(network, nft.issuerId, id);
    const [name, setName] = useState<string | null>();
    const [uri, isNftUriLoading] = useNftMetadataUri(standardMetadata?.uri);

    useEffect(() => {
        setName(null);
        if (standardMetadata) {
            setName(standardMetadata.name);
        }
    }, [standardMetadata]);

    const unsupportedFormatOrLoading = isNftUriLoading ? (
        loadingImagePlaceholderCompact
    ) : (
        unsupportedImageFormatPlaceholderCompact
    );

    const standardMetadataImageContent = !isWhitelisted ? (
        unregisteredMetadataPlaceholder
    ) : (standardMetadata && uri && isSupportedImageFormat(standardMetadata.type) ? (
        getNftImageContent(standardMetadata.type, uri, "nft-card__image")
    ) : (
        unsupportedFormatOrLoading
    ));

    const nftImageContent = !nft.metadata ? (
        noMetadataPlaceholder
    ) : (!standardMetadata ? (
        nonStandardMetadataPlaceholder
    ) : (standardMetadataImageContent));

    return (
        <div className="nft-card">
            <div className="nft-card__metadata">
                <Link
                    to={`/${network}/addr/${nftAddress.bech32}`}
                >
                    {nftImageContent}
                </Link>
                <span className="nft-card__id">
                    <TruncatedId
                        id={id}
                        link={`/${network}/addr/${nftAddress.bech32}`}
                    />
                </span>
            </div>
            {name && isWhitelisted && <span className="nft-card__name truncate">{name}</span>}
        </div>
    );
};

export default Nft;
