import { ALIAS_ADDRESS_TYPE, Ed25519Address, ED25519_ADDRESS_TYPE, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import NetworkContext from "../../context/NetworkContext";
import MessageButton from "../MessageButton";
import { AddressProps } from "./AddressProps";

/**
 * Component which will display an address.
 */
class Address extends Component<AddressProps> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const bech32 = this.buildAddress();

        return (
            <div className="address-type">
                <div className="card--label">
                    {NameHelper.getAddressTypeName(this.props.address.type)}
                </div>
                <div className="card--value row middle">
                    <Link
                        to={`/${this.context.name}/addr/${bech32}`}
                        className="margin-r-t"
                    >
                        {bech32}
                    </Link>
                    <MessageButton
                        onClick={() => ClipboardHelper.copy(bech32)}
                        buttonType="copy"
                        labelPosition="top"
                    />
                </div>
            </div>
        );
    }

    /**
     * Build bech32 address.
     * @returns The bech32 address.
     */
    private buildAddress() {
        let address: string = "";

        if (this.props.address.type === ED25519_ADDRESS_TYPE) {
            address = Converter.bytesToHex(
                new Ed25519Address(Converter.hexToBytes(this.props.address.pubKeyHash)).toAddress()
            );
        } else if (this.props.address.type === ALIAS_ADDRESS_TYPE) {
            address = this.props.address.aliasId;
        } else if (this.props.address.type === NFT_ADDRESS_TYPE) {
            address = this.props.address.nftId;
        }

        return Bech32AddressHelper.buildAddress(
                this.context.bech32Hrp,
                address,
                this.props.address.type
            ).bech32;
    }
}

export default Address;
