import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import "./NFT.scss";
import { NFTProps } from "./NFTProps";

/**
 * Component which will display a NFT.
 */
class NFT extends Component<NFTProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="NFT-row">
                <Link
                    to={
                        `/${this.props.network
                        }/nft/${this.props.tokenID}`
                    }
                    className="margin-r-t"
                >
                    <img
                        src={this.props.image}
                        alt="bundle"
                        className="nft-image"
                    />
                </Link>
                <span className="nft-name">Token: {this.props.tokenName}</span>
                <span className="nft-id">Token ID: {this.props.tokenID}</span>
            </div>
        );
    }
}

export default NFT;
