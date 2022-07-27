/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React from "react";
import { Link } from "react-router-dom";
import "./Nft.scss";
import { NftProps } from "./NftProps";

/**
 * Component which will display a NFT.
 */
const Nft: React.FC<NftProps> = ({ id, name, network, image }) => (
    <div className="NFT-row">
        <div className="nft-data">
            <Link
                to={`/${network}/nft/registry/${id}`}
                className="margin-r-t"
            >
                <img
                    src={image}
                    alt="bundle"
                    className="nft-image"
                />
            </Link>
            {name && <span className="nft-name">Token: {name}</span>}
            <span className="nft-id"><span>NFT Id: </span>
                <Link to={`/${network}/nft/registry/${id}`} className="margin-r-t" >
                    {id}
                </Link>
            </span>
        </div>
    </div>
);

export default Nft;
