import { INftAddress, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTokenRegistryNftCheck } from "../../../helpers/hooks/useTokenRegistryNftCheck";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import NetworkContext from "../../context/NetworkContext";
import {
    isSupportedImageFormat, tryParseNftMetadata, noMetadataPlaceholder,
    nonStandardMetadataPlaceholder, unregisteredMetadataPlaceholder, unsupportedImageFormatPlaceholder
} from "./NftMetadataUtils";
import { NftProps } from "./NftProps";
import TruncatedId from "./TruncatedId";
import "./Nft.scss";

const Nft: React.FC<NftProps> = ({ network, nft }) => {
    const id = nft.nftId;
    const standardMetadata = nft.metadata ? tryParseNftMetadata(nft.metadata) : null;
    const { bech32Hrp } = useContext(NetworkContext);
    const address: INftAddress = { type: NFT_ADDRESS_TYPE, nftId: id };
    const nftAddress = Bech32AddressHelper.buildAddress(bech32Hrp, address);
    const [isWhitelisted] = useTokenRegistryNftCheck(network, nft.issuerId, id);
    const [name, setName] = useState<string | null>();
    const [uri, setUri] = useState<string | null>();

    useEffect(() => {
        if (standardMetadata) {
            setName(standardMetadata.name);
            setUri(standardMetadata.uri);
        }
    }, [standardMetadata]);

    const standardMetadataImageContent = !isWhitelisted ? (
        unregisteredMetadataPlaceholder
    ) : (standardMetadata && uri && isSupportedImageFormat(standardMetadata.type) ? (
        <img
            className="nft-card__image"
            src={uri}
            alt="bundle"
        />
    ) : (
        unsupportedImageFormatPlaceholder
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
            {name && <span className="nft-card__name truncate">{name}</span>}
        </div>
    );
};

export default Nft;

