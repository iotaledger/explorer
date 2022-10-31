import React, { Fragment, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import welcomeMessage from "../../../assets/modals/identity-resolver/welcome.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IdentityDiffStorageService } from "../../../services/identityDiffStorageService";
import { IdentityService } from "../../../services/identityService";
import AsyncComponent from "../AsyncComponent";
import "./IdentityStardustResolver.scss";
import CopyButton from "../CopyButton";
import JsonViewer from "../JsonViewer";
import Modal from "../Modal";
import Spinner from "../Spinner";
import { IdentityStardustResolverProps } from "./IdentityStardustResolverProps";
import { IdentityStardustResolverState } from "./IdentityStardustResolverState";

class IdentityStardustResolver extends AsyncComponent<
    RouteComponentProps<IdentityStardustResolverProps> & { protocolVersion: string },
    IdentityStardustResolverState
> {
    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * placeholder when messageId is not available.
     */
    private readonly EMPTY_MESSAGE_ID = "0".repeat(64);

    constructor(props: RouteComponentProps<IdentityStardustResolverProps> & { protocolVersion: string }) {
        super(props);


        this.state = {
            did: props.match.params.did,
            aliasId: getAliasId(props.match.params.did ?? ""),
            error: false,
            errorMessage: ""
        };
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (!this.state.did) {
            return;
        }

        const res = await ServiceFactory.get<IdentityService>("identity").resolveIdentityStardust(
            this.state.did,
            this.props.match.params.network
        );

        if (res.error) {
            this.setState({
                error: true,
                errorMessage: res.error
            });
            return;
        }

        this.setState({
            resolvedIdentity: res
        });
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._timerId) {
            clearTimeout(this._timerId);
            this._timerId = undefined;
        }
        IdentityDiffStorageService.instance.clearAll();
    }


    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div>
                <div className="row space-between wrap">
                    <div className="row middle">
                        <h1>
                            Decentralized Identifier
                        </h1>
                        <Modal icon="info" data={welcomeMessage} />
                    </div>
                </div>
                <div className="section">
                    <div className="section--data">
                        <div className="label">DID</div>
                        <div className="row middle value code highlight margin-b-s">
                            <div className="margin-r-t">{this.props.match.params.did}</div>
                            <CopyButton copy={this.props.match.params.did} />
                        </div>

                        {/* ALIAS ID */}
                        {this.state.resolvedIdentity?.document &&
                            !this.state.error && (
                                <Fragment>
                                    {/* ALIAS ID */}
                                    <div className="margin-b-s">
                                        <div className="label">Alias ID</div>
                                        <div className="value code row middle">
                                            <div className="margin-r-t">
                                                <a onClick={() => {
                                                    // eslint-disable-next-line max-len
                                                    window.location.href = `/${this.props.match.params.network}/alias/${this.state.aliasId}`;
                                                }}
                                                >
                                                    {this.state.aliasId}
                                                </a>
                                            </div>
                                            <CopyButton
                                                copy={this.state.aliasId}
                                            />
                                        </div>
                                    </div>
                                    {/* GOVERNOR ADDRESS */}
                                    <div className="margin-b-s">
                                        <div className="label">Governor</div>
                                        <div className="value code row middle">
                                            <div className="margin-r-t">
                                                <a onClick={() => {
                                                    window.location.href =
                                                        // eslint-disable-next-line max-len
                                                        `/${this.props.match.params.network}/search/${this.state.resolvedIdentity?.document?.meta.governorAddress}`;
                                                }}
                                                >
                                                    {this.state.resolvedIdentity.document.meta.governorAddress}
                                                </a>
                                            </div>
                                            <CopyButton
                                                copy={this.state.resolvedIdentity.document.meta.governorAddress}
                                            />
                                        </div>
                                    </div>

                                    {/* STATE CONTROLLER ADDRESS */}
                                    <div className="margin-b-s">
                                        <div className="label">State Controller</div>
                                        <div className="value code row middle">
                                            <div className="margin-r-t">
                                                <a onClick={() => {
                                                    // eslint-disable-next-line max-len
                                                    window.location.href = `/${this.props.match.params.network}/search/${this.state.resolvedIdentity?.document?.meta.stateControllerAddress}`;
                                                }}
                                                >
                                                    {this.state.resolvedIdentity.document.meta.stateControllerAddress}
                                                </a>
                                            </div>
                                            <CopyButton
                                                copy={this.state.resolvedIdentity.document.meta.stateControllerAddress}
                                            />
                                        </div>
                                    </div>
                                </Fragment>
                            )}
                    </div>
                </div>
                <div className="section w100">
                    <div className="section--header">
                        <h3>
                            DID Document
                        </h3>
                    </div>
                    <div className="section--data">

                        {/* SPINNER */}
                        {!this.state.resolvedIdentity && !this.state.error && (
                            <React.Fragment>
                                <h3 className="margin-r-s">Resolving DID ...</h3>
                                <Spinner />
                            </React.Fragment>
                        )}

                        {/* ERROR CASE */}
                        {this.state.error && (
                            <div className="identity-json-container did-error">
                                <p className="margin-b-t">ಠ_ಠ </p>
                                <p className="">{this.state.errorMessage}</p>
                            </div>
                        )}

                        {/* DOCUMENT */}
                        {this.state.resolvedIdentity && !this.state.error && (
                            <div
                                className="
                                        json-wraper-stardust-identity
                                        card--value
                                        card--value-textarea
                                        card--value-textarea__json
                                    "
                            >
                                <JsonViewer
                                    json={JSON.stringify(
                                        this.state.resolvedIdentity?.document?.doc,
                                        null,
                                        4
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="row margin-b-s row--tablet-responsive">
                    {this.state.resolvedIdentity && !this.state.error && (
                        <div className="section w100">
                            <div className="section--header">
                                <h3>
                                    Metadata
                                </h3>
                            </div>
                            <div className="section--data">
                                <div
                                    className="
                                        json-wraper-stardust-identity
                                        card--value
                                        card--value-textarea
                                        card--value-textarea__json
                                    "
                                >
                                    <JsonViewer
                                        json={JSON.stringify(
                                            this.state.resolvedIdentity?.document?.meta,
                                            null,
                                            3
                                        )}
                                    />
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
export default IdentityStardustResolver;

/**
 *
 * @param did DID
 * @returns Alias ID
 */
function getAliasId(did: string): string {
    return did.slice(Math.max(0, did.indexOf(":0x") + 1));
}

