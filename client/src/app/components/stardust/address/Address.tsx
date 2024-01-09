/* eslint-disable react/static-property-placement */
import React, { Component, ReactNode } from "react";
import { AddressProps } from "./AddressProps";
import { Bech32AddressHelper } from "~helpers/stardust/bech32AddressHelper";
import { NameHelper } from "~helpers/stardust/nameHelper";
import NetworkContext from "../../../context/NetworkContext";
import TruncatedId from "../TruncatedId";

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
    const address = Bech32AddressHelper.buildAddress(this.context.bech32Hrp, this.props.address);
    const link = `/${this.context.name}/addr/${address.bech32}`;

    return (
      <div className="address-type">
        <div className="card--label">{NameHelper.getAddressTypeName(this.props.address.type)}</div>
        <div className="card--value">
          <TruncatedId id={address.bech32} link={link} showCopyButton />
        </div>
      </div>
    );
  }
}

export default Address;
