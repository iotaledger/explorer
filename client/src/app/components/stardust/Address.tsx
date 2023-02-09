import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
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
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const address = Bech32AddressHelper.buildAddress(
            this.context.bech32Hrp,
            this.props.address
        );
        const bech32Short = `${address.bech32.slice(0, 12)}....${address.bech32.slice(-12)}`;
        const link = `/${this.context.name}/addr/${address.bech32}`;

        return (
            <div className="address-type">
                <div className="card--label">
                    {NameHelper.getAddressTypeName(this.props.address.type)}
                </div>
                <div className="card--value row middle">
                    <Link
                        to={link}
                        className="margin-r-t"
                    >
                        {bech32Short}
                    </Link>
                    <CopyButton copy={address.bech32} />
                </div>
            </div>
        );
    }
}

export default Address;
