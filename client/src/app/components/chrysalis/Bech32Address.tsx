/* eslint-disable max-len */
import React, { Component, ReactNode } from "react";
import { Bech32AddressProps } from "../Bech32AddressProps";
import CopyButton from "../CopyButton";

/**
 * Component which will display an Bech32Address.
 */
class Bech32Address extends Component<Bech32AddressProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="bech32-address">
                {this.props.addressDetails?.bech32 && (
                    <div className="section--data">
                        {!this.props.hideLabel && (
                            <div className="label">
                                Address
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
                                    {this.props.truncateAddress
                                        ? `${this.props.addressDetails.bech32.slice(0, 7)}...${this.props.addressDetails.bech32.slice(-7)} `
                                        : this.props.addressDetails.bech32}
                                </button>
                            )}
                            {!this.props.history && (
                                <span className="margin-r-t">{this.props.addressDetails.bech32}</span>
                            )}
                            {this.props.showCopyButton && <CopyButton copy={this.props.addressDetails?.bech32} />}
                        </div>
                    </div>
                )}
                {this.props.advancedMode && this.props.addressDetails?.typeLabel && this.props.addressDetails?.hex && (
                    <div className="section--data">
                        <div className="label">
                            {this.props.addressDetails.typeLabel} Address
                        </div>
                        <div className="value row middle code">
                            {this.props.history && (
                                <button
                                    type="button"
                                    className="margin-r-t"
                                    onClick={() => this.props.history?.push(
                                        `/${this.props.network
                                        }/addr/${this.props.addressDetails?.hex}`)}
                                >
                                    {this.props.addressDetails?.hex}
                                </button>
                            )}
                            {!this.props.history && (
                                <span className="margin-r-t">{this.props.addressDetails?.hex}</span>
                            )}
                            <CopyButton copy={this.props.addressDetails?.hex} />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Bech32Address;
