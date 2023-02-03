import React, { Component, ReactNode } from "react";
import { Bech32AddressProps } from "../Bech32AddressProps";
import CopyButton from "../CopyButton";
import TruncatedId from "./TruncatedId";

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
                                {this.props.addressDetails.typeLabel} Address
                            </div>
                        )}
                        <div className="value row middle code">
                            {this.props.history && (
                                <button
                                    type="button"
                                    className="margin-r-t"
                                    onClick={() => this.props.history?.push(
                                        `/${this.props.network}/addr/${this.props.addressDetails?.bech32}`
                                    )}
                                >
                                    <TruncatedId id={this.props.addressDetails.bech32} />
                                </button>
                            )}
                            {!this.props.history && (
                                <TruncatedId id={this.props.addressDetails.bech32} />
                            )}
                            {this.props.showCopyButton && <CopyButton copy={this.props.addressDetails?.bech32} />}
                        </div>
                    </div>
                )}
                {this.props.advancedMode && this.props.addressDetails?.typeLabel && this.props.addressDetails?.hex && (
                    <div className="section--data">
                        <div className="label">
                            {this.props.addressDetails.typeLabel} Id
                        </div>
                        <div className="value row middle code">
                            {this.props.history && (
                                <button
                                    type="button"
                                    className="margin-r-t"
                                    onClick={() => this.props.history?.push(
                                        `/${this.props.network}/addr/${this.props.addressDetails?.hex}`
                                    )}
                                >
                                    <TruncatedId id={this.props.addressDetails?.hex} />
                                </button>
                            )}
                            {!this.props.history && (
                                <TruncatedId id={this.props.addressDetails?.hex} />
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
