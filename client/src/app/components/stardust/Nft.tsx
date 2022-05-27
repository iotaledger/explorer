/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React from "react";
import { Link } from "react-router-dom";
import "./Nft.scss";
import { NftProps } from "./NftProps";

/**
 * Component which will display a NFT.
 */
const Nft: React.FC<NftProps> = ({ id, name, network, image }) => {
    const shortId = `${id.slice(0, 12)}...${id.slice(-12)}`;

    /**
     * Render the component.
     * @returns The node to render.
     */
    return (
        <div className="NFT-row">
            <Link
                to={`/${network}/nft/${id}`}
                className="margin-r-t"
            >
                <img
                    src={image}
                    alt="bundle"
                    className="nft-image"
                />
            </Link>
            {name && <span className="nft-name">Token: {name}</span>}
            <span className="nft-id">NFT Id: {shortId}</span>
        </div>
    );
};

export default Nft;
