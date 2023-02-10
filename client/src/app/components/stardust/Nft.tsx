import { INftAddress, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import metadataMissingPlaceholder from "../../../assets/stardust/missing-nft-metadata.png";
import unsupportedFormatPlaceholder from "../../../assets/stardust/unsupported-format.png";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import NetworkContext from "../../context/NetworkContext";
import { NftProps } from "./NftProps";
import TruncatedId from "./TruncatedId";
import "./Nft.scss";

/**
 * Supported image MIME formats.
 */
const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/gif"]);

const Nft: React.FC<NftProps> = ({ id, network, metadata }) => {
    const { bech32Hrp } = useContext(NetworkContext);
    const address: INftAddress = { type: NFT_ADDRESS_TYPE, nftId: id };
    const nftAddress = Bech32AddressHelper.buildAddress(bech32Hrp, address);
    const nftImage = !metadata ? (
        <img
            className="nft-card__image"
            src={metadataMissingPlaceholder}
        />
    ) : (isSupportedImageFormat(metadata.type) ? (
        <img
            className="nft-card__image"
            src={metadata?.uri}
            alt="bundle"
        />
    ) : (
        <img
            className="nft-card__image"
            src={unsupportedFormatPlaceholder}
        />
    ));

    return (
        <div className="nft-card">
            <div className="nft-card__metadata">
                <Link
                    to={`/${network}/addr/${nftAddress.bech32}`}
                >
                    {nftImage}
                </Link>
                {metadata?.name && <span className="nft-card__name nft-metadata__name">{metadata.name}</span>}
            </div>
            <span className="nft-card__id">
                <TruncatedId
                    id={id}
                    link={`/${network}/addr/${nftAddress.bech32}`}
                />
            </span>
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
