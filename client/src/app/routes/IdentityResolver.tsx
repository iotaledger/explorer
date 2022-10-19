/* eslint-disable max-len */
import React, { Fragment, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../factories/serviceFactory";
import { NetworkService } from "../../services/networkService";
import AsyncComponent from "../components/AsyncComponent";
import IdentityChrysalisResolver from "../components/identity/IdentityChrysalisResolver";
import IdentitySearchInput from "../components/identity/IdentitySearchInput";
import IdentityStardustResolver from "../components/identity/IdentityStardustResolver";
import Modal from "../components/Modal";
import welcomeMessage from "./../../assets/modals/identity-resolver/welcome.json";
import "./IdentityResolver.scss";
import { IdentityResolverProps } from "./IdentityResolverProps";
import { IdentityResolverState } from "./IdentityResolverState";


class IdentityResolver extends AsyncComponent<
    RouteComponentProps<IdentityResolverProps> & { isSupported: boolean },
    IdentityResolverState
> {

    constructor(props: RouteComponentProps<IdentityResolverProps> & { isSupported: boolean }) {
        super(props);

        this.state = {
            didExample: undefined,
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
                                        {!this.props.isSupported && (
                                            <div className="unsupported-network">
                                                Network is not supported. IOTA Identity only supports chrysalis phase 2
                                                networks, such as the IOTA main network.
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
                                                    the information from an IOTA Tangle. The tool has debugging
                                                    capabilities to view the entire history of a DID Document, including
                                                    invalid DID messages.
                                                </p>
                                            </div>
                                            {this.props.isSupported && (
                                                <div className="row middle margin-b-s row--tablet-responsive">
                                                    <IdentitySearchInput
                                                        compact={false}
                                                        onSearch={e => {
                                                            this.props.history.push(e);
                                                        }}
                                                        network={this.props.match.params.network}
                                                    />
                                                </div>
                                            )}

                                            {this.state.didExample && (
                                                <button
                                                    className="load-history-button"
                                                    onClick={() => {
                                                        this.props.history.push(
                                                            // eslint-disable-next-line max-len
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
                                        <IdentityChrysalisResolver {...this.props} />
                                        {/* <IdentityStardustResolver {...this.props} /> */}
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
