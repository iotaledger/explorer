import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import NetworkContext from "../../context/NetworkContext";
import CopyButton from "../CopyButton";
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
        const bech32 = Bech32AddressHelper.buildAddress(
            this.context.bech32Hrp,
            this.props.address
        ).bech32;

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
                    <CopyButton
                        onClick={() => ClipboardHelper.copy(bech32)}
                        buttonType="copy"
                        labelPosition="top"
                    />
                </div>
            </div>
        );
    }
}

export default Address;
