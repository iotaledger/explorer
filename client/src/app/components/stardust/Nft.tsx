import { INftAddress, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTokenRegistryNftCheck } from "../../../helpers/hooks/useTokenRegistryNftCheck";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { tryParseNftMetadata } from "../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import { ImagePlaceholder } from "./address/ImagePlaceholder";
import { NftProps } from "./NftProps";
import TruncatedId from "./TruncatedId";
import "./Nft.scss";

/**
 * Supported image MIME formats.
 */
const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/gif"]);

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
        <ImagePlaceholder message="Unregistered NFT metadata" compact />
    ) : (standardMetadata && uri && isSupportedImageFormat(standardMetadata.type) ? (
        <img
            className="nft-card__image"
            src={uri}
            alt="bundle"
        />
    ) : (
        <ImagePlaceholder message="Unsupported image format" compact />
    ));

    const nftImageContent = !nft.metadata ? (
        <ImagePlaceholder message="No metadata" compact />
    ) : (!standardMetadata ? (
        <ImagePlaceholder message="Unsupported metadata format" compact />
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
