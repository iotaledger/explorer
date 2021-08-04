import React, { Component, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import IdentitySearchInput from "../components/identity/IdentitySearchInput";

import { IdentityResolverProps } from "./IdentityResolverProps";
import { IdentityResolverState } from "./IdentityResolverState";
import "./IdentityResolver.scss";

class IdentityResolver extends Component<RouteComponentProps<IdentityResolverProps>, IdentityResolverState> {
    constructor(props: RouteComponentProps<IdentityResolverProps>) {
        super(props);
        console.log(props);

        this.state = {
            identityResolved: false,
            resolvedIdentity: "",
            did: props.match.params.did,
        };

    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="streams-v0">
                <div className="wrapper">
                    <div className="inner">
                        <h1>Identity Resolver</h1>
                        <div className="row">
                            <div className="cards">
                                {!this.state.identityResolved && (
                                    <div className="card">
                                        <div className="card--header card--header__space-between">
                                            <h2>General</h2>
                                        </div>
                                        <div className="card--content">
                                            <div className="row middle margin-b-s row--tablet-responsive">
                                                <div className="card--label form-label-width">DID</div>
                                                <IdentitySearchInput
                                                    compact={false}
                                                    onSearch={() => {
                                                        this.setState({ identityResolved: true });
                                                    }}
                                                />
                                                <div>{this.state.did}</div>
                                            </div>
                                        </div>
                                    </div>
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
