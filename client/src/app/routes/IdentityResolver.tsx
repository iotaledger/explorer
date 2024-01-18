/* eslint-disable max-len */
import React, { Fragment, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import welcomeMessage from "~assets/modals/identity-resolver/welcome.json";
import { IdentityResolverProps } from "./IdentityResolverProps";
import { IdentityResolverState } from "./IdentityResolverState";
import { CHRYSALIS } from "~models/config/protocolVersion";
import AsyncComponent from "../components/AsyncComponent";
import IdentityChrysalisResolver from "../components/identity/IdentityChrysalisResolver";
import IdentitySearchInput from "../components/identity/IdentitySearchInput";
import Modal from "../components/Modal";
import "./IdentityResolver.scss";

class IdentityResolver extends AsyncComponent<
    RouteComponentProps<IdentityResolverProps> & { protocolVersion: string },
    IdentityResolverState
> {
    constructor(props: RouteComponentProps<IdentityResolverProps> & { protocolVersion: string }) {
        super(props);
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="identity">
                <div className="wrapper">
                    <div className="inner">
                        <div className="row">
                            <div className="cards">
                                {!this.props.match.params.did && (
                                    <Fragment>
                                        <div>
                                            <div className="row middle">
                                                <h1>Decentralized Identifier</h1>
                                                <Modal icon="info" data={welcomeMessage} />
                                            </div>

                                            <div>
                                                <p className="tool-description">
                                                    The Identity Resolver is a tool for resolving Decentralized Identifiers (DIDs) into
                                                    their associated DID Document, by retrieving the information from an IOTA or Shimmer
                                                    network.
                                                </p>
                                            </div>
                                            <div className="row middle margin-b-s row--tablet-responsive">
                                                <IdentitySearchInput
                                                    compact={false}
                                                    onSearch={(e) => {
                                                        this.props.history.push(
                                                            `/${this.props.match.params.network}/identity-resolver/${e}`,
                                                        );
                                                    }}
                                                    network={this.props.match.params.network}
                                                />
                                            </div>
                                        </div>
                                    </Fragment>
                                )}
                                {this.props.match.params.did && (
                                    <div>{this.props.protocolVersion === CHRYSALIS && <IdentityChrysalisResolver {...this.props} />}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default IdentityResolver;
