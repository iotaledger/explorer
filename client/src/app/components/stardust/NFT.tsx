import React, { Component, ReactNode } from "react";
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
                <img
                    src={this.props.image}
                    alt="bundle"
                    className="nft-image"
                />
                <span className="nft-name">Token: {this.props.tokenName}</span>
                <span className="nft-id">Token ID: {this.props.tokenID}</span>
            </div>
        );
    }
}

export default NFT;
