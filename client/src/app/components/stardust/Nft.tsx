/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React from "react";
import { Link } from "react-router-dom";
import "./Nft.scss";
import { NftProps } from "./NftProps";

/**
 * Supported schema type.
 */
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/gif"];

/**
 * Component which will display a NFT.
 */
const Nft: React.FC<NftProps> = ({ id, network, metadata }) => (
    <div className="NFT-row">
        <div className="nft-data">
            <Link
                to={`/${network}/nft-registry/${id}`}
                className="margin-r-t"
            >
                {metadata && !metadata?.error && validateMetadataType(metadata.type) ?
                    <img
                        src={metadata?.uri}
                        alt="bundle"
                        className="nft-image"
                    /> :
                    <div>Format not supported</div>}
            </Link>
            {metadata?.name && <span className="nft-name">Token: {metadata.name}</span>}
            <span className="nft-id"><span>NFT Id: </span>
                <Link to={`/${network}/nft-registry/${id}`} className="margin-r-t" >
                    {id}
                </Link>
            </span>
        </div>
    </div>
);

/**
 * Validate schema type.
 * @param nftType The schema type.
 * @returns result.
 */
function validateMetadataType(nftType: string | undefined) {
    return SUPPORTED_TYPES.find(type => nftType === type);
}

export default Nft;
