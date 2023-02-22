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
    const metadata = nft.metadata ? tryParseNftMetadata(nft.metadata) : undefined;
    const { bech32Hrp } = useContext(NetworkContext);
    const address: INftAddress = { type: NFT_ADDRESS_TYPE, nftId: id };
    const nftAddress = Bech32AddressHelper.buildAddress(bech32Hrp, address);
    const [isWhitelisted] = useTokenRegistryNftCheck(network, nft.issuerId, id);
    const [name, setName] = useState<string | undefined>();
    const [uri, setUri] = useState<string | undefined>();

    useEffect(() => {
        if (metadata && isWhitelisted) {
            setName(metadata.name);
            setUri(metadata.uri);
        }
    }, [isWhitelisted]);

    const nftImage = !metadata ? (
        <ImagePlaceholder message="No metadata" compact />
    ) : (uri && isSupportedImageFormat(metadata.type) ? (
        <img
            className="nft-card__image"
            src={uri}
            alt="bundle"
        />
    ) : (
        <ImagePlaceholder message="Unsupported image format" compact />
    ));

    return (
        <div className="nft-card">
            <div className="nft-card__metadata">
                <Link
                    to={`/${network}/addr/${nftAddress.bech32}`}
                >
                    {nftImage}
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
