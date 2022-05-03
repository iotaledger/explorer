import { ALIAS_ADDRESS_TYPE, ED25519_ADDRESS_TYPE, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React, { Component, ReactNode } from "react";
import { AddressProps } from "./AddressProps";

/**
 * Component which will display an address.
 */
class Address extends Component<AddressProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="address-type">
                {this.props.address.type === ED25519_ADDRESS_TYPE && (
                    <React.Fragment>
                        <div className="card--label">
                            Public key hash:
                        </div>
                        <div className="card--value row">
                            {this.props.address.pubKeyHash}
                        </div>
                    </React.Fragment>
                )}
                {this.props.address.type === ALIAS_ADDRESS_TYPE && (
                    <React.Fragment>
                        <div className="card--label">
                            Alias Id:
                        </div>
                        <div className="card--value row">
                            {this.props.address.aliasId}
                        </div>
                    </React.Fragment>
                )}
                {this.props.address.type === NFT_ADDRESS_TYPE && (
                    <React.Fragment>
                        <div className="card--label">
                            Nft Id:
                        </div>
                        <div className="card--value row">
                            {this.props.address.nftId}
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }
}

export default Address;
