/* eslint-disable max-len */
import React, { Fragment, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import welcomeMessage from "./../../assets/modals/identity-resolver/welcome.json";
import { IdentityResolverProps } from "./IdentityResolverProps";
import { IdentityResolverState } from "./IdentityResolverState";
import { ServiceFactory } from "../../factories/serviceFactory";
import { CHRYSALIS, LEGACY, STARDUST } from "../../models/config/protocolVersion";
import { NetworkService } from "../../services/networkService";
import AsyncComponent from "../components/AsyncComponent";
import IdentityChrysalisResolver from "../components/identity/IdentityChrysalisResolver";
import IdentitySearchInput from "../components/identity/IdentitySearchInput";
import IdentityStardustResolver from "../components/identity/IdentityStardustResolver";
import Modal from "../components/Modal";
import "./IdentityResolver.scss";


class IdentityResolver extends AsyncComponent<
    RouteComponentProps<IdentityResolverProps> & { protocolVersion: string },
    IdentityResolverState
> {
    constructor(props: RouteComponentProps<IdentityResolverProps> & { protocolVersion: string }) {
        super(props);

        this.state = {
            didExample: undefined
        };
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        this.setDidExample();
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
                                        {this.props.protocolVersion === LEGACY && (
                                            <div className="unsupported-network">
                                                This network is not supported!
                                            </div>
                                        )}

                                        <div>
                                            <div className="row middle">
                                                <h1>
                                                    Decentralized Identifier
                                                </h1>
                                                <Modal icon="info" data={welcomeMessage} />
                                            </div>

                                            <div>
                                                <p className="tool-description">
                                                    The Identity Resolver is a tool for resolving Decentralized
                                                    Identifiers (DIDs) into their associated DID Document, by retrieving
                                                    the information from an IOTA or Shimmer network.
                                                </p>
                                            </div>
                                            {this.props.protocolVersion !== LEGACY && (
                                                <div className="row middle margin-b-s row--tablet-responsive">
                                                    <IdentitySearchInput
                                                        compact={false}
                                                        onSearch={e => {
                                                            this.props.history.push(
                                                                `/${this.props.match.params.network}/identity-resolver/${e}`
                                                            );
                                                        }}
                                                        network={this.props.match.params.network}
                                                    />
                                                </div>
                                            )}

                                            {this.state.didExample && this.props.protocolVersion === STARDUST && (
                                                <button
                                                    className="load-history-button"
                                                    onClick={() => {
                                                        this.props.history.push(
                                                            `/${this.props.match.params.network}/identity-resolver/${this.state.didExample}`
                                                        );
                                                    }}
                                                    type="button"
                                                >
                                                    DID Example
                                                </button>
                                            )}
                                        </div>
                                    </Fragment>
                                )}
                                {this.props.match.params.did && (
                                    <div>
                                        {this.props.protocolVersion === LEGACY && (
                                            <div>
                                                <div className="unsupported-network">
                                                    This network is not supported!
                                                </div>
                                            </div>
                                        )}
                                        {this.props.protocolVersion === CHRYSALIS && (
                                            <IdentityChrysalisResolver {...this.props} />
                                        )}
                                        {this.props.protocolVersion === STARDUST && (
                                            <IdentityStardustResolver {...this.props} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private setDidExample() {
        const networkService = ServiceFactory.get<NetworkService>("network");
        const networks = networkService.networks();

        const network = networks.find(n => n.network === this.props.match.params.network);
        this.setState({
            didExample: network?.didExample
        });
    }
}

export default IdentityResolver;
