import React, { Component, ReactNode } from "react";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { Bech32AddressProps } from "../Bech32AddressProps";
import CopyButton from "../CopyButton";

/**
 * Component which will display an Bech32Address.
 */
class Bech32Address extends Component<Bech32AddressProps> {
    /**
     * Create a new instance of Bech32Address.
     * @param props The props.
     */
    constructor(props: Bech32AddressProps) {
        super(props);

        this.state = {
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const truncatedAddress =
            `${this.props.addressDetails?.bech32?.slice(0, 7)}...${this.props.addressDetails?.bech32?.slice(-7)}` ?? "";

        return (
            <div className="bech32-address">
                {this.props.addressDetails?.bech32 && (
                    <div className="section--data">
                        {!this.props.hideLabel && (
                            <div className="label">
                                {this.props.addressDetails.typeLabel} Address
                            </div>
                        )}
                        <div className="value row middle code">
                            {this.props.history && (
                                <button
                                    type="button"
                                    className="margin-r-t"
                                    onClick={() => this.props.history?.push(
                                        `/${this.props.network
                                        }/addr/${this.props.addressDetails?.bech32}`)}
                                >
                                    {this.props.truncateAddress ? truncatedAddress : this.props.addressDetails.bech32}
                                </button>
                            )}
                            {!this.props.history && (
                                <span className="margin-r-t">{this.props.addressDetails.bech32}</span>
                            )}
                            {!this.props.truncateAddress && (
                                <CopyButton
                                    onClick={() => ClipboardHelper.copy(this.props.addressDetails?.bech32)}
                                    buttonType="copy"
                                    labelPosition="top"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Bech32Address;
