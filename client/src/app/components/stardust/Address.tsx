
/* eslint-disable react/static-property-placement */
import { ALIAS_ADDRESS_TYPE, ED25519_ADDRESS_TYPE, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React, { Component, ReactNode } from "react";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import Bech32HrpContext from "../../../helpers/stardust/bech32HrpContext";
import MessageButton from "../MessageButton";
import { AddressProps } from "./AddressProps";
import { AddressState } from "./AddressState";

/**
 * Component which will display an address.
 */
class Address extends Component<AddressProps, AddressState> {
    /**
     * Create a new instance of NewOutput.
     * @param props The props.
     */
    constructor(props: AddressProps) {
        super(props);

        this.state = {
            bech32: ""
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        await this.buildAddress();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="address-type">
                <div className="card--label">
                    Address:
                </div>
                <div className="card--value row middle">
                    <button
                        type="button"
                        className="margin-r-t"
                    >
                        {this.state.bech32}
                    </button>
                    <MessageButton
                        onClick={() => ClipboardHelper.copy(this.state.bech32)}
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
    private async buildAddress() {
        let address: string = "";

        if (this.props.address.type === ED25519_ADDRESS_TYPE) {
            address = this.props.address.pubKeyHash;
        } else if (this.props.address.type === ALIAS_ADDRESS_TYPE) {
            address = this.props.address.aliasId;
        } else if (this.props.address.type === NFT_ADDRESS_TYPE) {
            address = this.props.address.nftId;
        }

        this.setState({
            bech32: Bech32AddressHelper.buildAddress(
                this.context.bech32Hrp,
                address,
                this.props.address.type
            ).bech32
        });
    }
}

Address.contextType = Bech32HrpContext;
export default Address;
