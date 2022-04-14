/* eslint-disable react/function-component-definition */
import React from "react";
import "./NFT.scss";
import { Link } from "react-router-dom";
import { NFTProps } from "./NFTProps";

export const NFT: React.FC<NFTProps> = ({ image, tokenName, tokenID, network }) => (
    <div className="NFT-row">
        <Link
            to={
            `/${network}/nft/
            ${tokenID}`
            }
            className="margin-r-t"
        >
            <img
                src={image}
                alt="bundle"
                className="nft-image"
            />
        </Link>
        <span className="nft-name">Token: {tokenName}</span>
        <span className="nft-id">Token ID: {tokenID}</span>
    </div>
);
