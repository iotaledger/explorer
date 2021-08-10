import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ReactComponent as IdentityIcon } from "../../assets/identity-icon-hex.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ClipboardHelper } from "../../helpers/clipboardHelper";
import { IdentityService } from "../../services/identityService";
import AsyncComponent from "../components/AsyncComponent";
import IdentitySearchInput from "../components/identity/IdentitySearchInput";
import JsonViewer from "../components/JsonViewer";
import MessageButton from "../components/MessageButton";
import Spinner from "../components/Spinner";

import { IdentityResolverProps } from "./IdentityResolverProps";
import { IdentityResolverState } from "./IdentityResolverState";

import "./IdentityResolver.scss";

class IdentityResolver extends AsyncComponent<
    RouteComponentProps<IdentityResolverProps>,
    IdentityResolverState
> {
    constructor(props: RouteComponentProps<IdentityResolverProps>) {
        super(props);
        console.log(props);

        this.state = {
            identityResolved: false,
            resolvedIdentity: "",
            did: props.match.params.did,
            error: false,
            errorMessage: "",
        };
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (!this.state.did) {
            return;
        }
        let res;
        try {
            res = await ServiceFactory.get<IdentityService>("identity").resolveIdentity(this.state.did);
            console.log(res);
            this.setState({
                resolvedIdentity: res,
                identityResolved: true,
            });
            this.setState({
                resolvedIdentity: res,
                identityResolved: true,
            });
        } catch (e) {
            this.setState({
                error: true,
                errorMessage: e,
            });
        }
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
                        <div className="row">
                            <div className="cards">
                                {!this.state.did && (
                                    <div>
                                        <div className="identity-title">
                                            <IdentityIcon />
                                            <h1>Identity Resolver</h1>
                                        </div>
                                        <div className="card">
                                            <div className="card--header card--header__space-between">
                                                <h2>General</h2>
                                            </div>
                                            <div className="card--content">
                                                <div className="row middle margin-b-s row--tablet-responsive">
                                                    <div className="card--label form-label-width">DID</div>
                                                    <IdentitySearchInput
                                                        onSearch={(e) => {
                                                            this.props.history.push(e);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {this.state.did && (
                                    <div>
                                        <h1>Desentralized Identifier</h1>

                                        <div className="card margin-b-s">
                                            <div className="card--header card--header__space-between">
                                                <h2>General</h2>
                                            </div>
                                            <div className="card--content">
                                                <div className="row middle margin-b-s row--tablet-responsive">
                                                    <div className="card--value card--value--textarea">
                                                        <div className="card--label form-label-width">
                                                            DID
                                                        </div>
                                                        <div className="row ">
                                                            <div className="margin-r-t">{this.state.did}</div>
                                                            <MessageButton
                                                                onClick={() =>
                                                                    ClipboardHelper.copy(this.state.did)
                                                                }
                                                                buttonType="copy"
                                                                labelPosition="top"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card">
                                            <div className="card--header card--header">
                                                <h2>Content</h2>
                                                {!this.state.identityResolved && !this.state.error && (
                                                    <Spinner />
                                                )}
                                            </div>

                                            <div className="card--content">
                                                <div className="row middle margin-b-s row--tablet-responsive">
                                                    {this.state.resolvedIdentity !== "" && (
                                                        <div className="identity-json-container">
                                                            <JsonViewer json={this.state.resolvedIdentity} />
                                                        </div>
                                                    )}
                                                    {this.state.error && (
                                                        <div className="identity-json-container did-error">
                                                            <p className="margin-b-t">ಠ_ಠ </p>
                                                            <p className="">{this.state.errorMessage}</p>
                                                        </div>
                                                    )}
                                                </div>
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
