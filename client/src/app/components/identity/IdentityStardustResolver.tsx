import * as identity from "@iota/identity-wasm/web";
import { DomainLinkageConfiguration, EdDSAJwsVerifier, JwtCredentialValidationOptions, JwtDomainLinkageValidator, LinkedDomainService } from "@iota/identity-wasm/web";
import React, { Fragment, ReactNode } from "react";
import IdentityDomainResolver from "./domains/IdentityDomainResolver";
import { IdentityStardustResolverProps } from "./IdentityStardustResolverProps";
import { IdentityStardustResolverState } from "./IdentityStardustResolverState";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IdentityService } from "../../../services/identityService";
import AsyncComponent from "../AsyncComponent";
import "./IdentityStardustResolver.scss";
import CopyButton from "../CopyButton";
import JsonViewer from "../JsonViewer";
import Spinner from "../Spinner";

class IdentityStardustResolver extends AsyncComponent<IdentityStardustResolverProps,
    IdentityStardustResolverState
> {
    constructor(props: IdentityStardustResolverProps) {
        super(props);
        this.state = {
            did: props.did,
            aliasId: getAliasId(props.did ?? ""),
            errorMessage: ""
        };
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (!this.state.did) {
            return;
        }

        const resolvedIdentity = await ServiceFactory.get<IdentityService>("identity").resolveIdentityStardust(
            this.state.did,
            this.props.network
        );

        if (resolvedIdentity.error) {
            this.setState({
                errorMessage: resolvedIdentity.error
            });
            return;
        }

        this.setState({
            resolvedIdentity
        });

        await identity.init("/identity_wasm_bg.wasm");

        const didDocument = identity.IotaDocument.fromJSON(resolvedIdentity.document);
        // Get the Linked Domain Services from the DID Document.
        const linkedDomainServices = didDocument
            .service()
            .filter(service => LinkedDomainService.isValid(service))
            .map(service => LinkedDomainService.fromService(service));

        const verifiedDomains = new Map<string, Promise<void>>();

        for (const entry of linkedDomainServices) {
            for (const domain of entry.domains()) {
                verifiedDomains.set(domain, new Promise(async (resolve, reject) => {
                    // Note that according to the specs, the DID Configuration resource must exist
                    // at the origin's root, Well-Known Resource directory.
                    const configurationUrl = new URL("/.well-known/did-configuration.php", domain); // TODO: .json

                    let fetchedConfigurationResource;

                    try {
                        fetchedConfigurationResource = await fetch(configurationUrl);
                    } catch (err) {
                        console.log(err);
                        reject(new Error(`could not fetch configuration from ${domain}`));
                        return;
                    }

                    let parsedConfigurationResource;

                    try {
                        const jsonResponse = await fetchedConfigurationResource.json();
                        parsedConfigurationResource = DomainLinkageConfiguration.fromJSON(jsonResponse);
                    } catch (err) {
                        console.log(err);
                        reject(new Error(`could not parse configuration from domain ${domain}`));
                        return;
                    }

                    try {
                        new JwtDomainLinkageValidator(new EdDSAJwsVerifier()).validateLinkage(
                            didDocument,
                            parsedConfigurationResource,
                            domain,
                            new JwtCredentialValidationOptions()
                        );
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                }));
            }
        }

        this.setState({
            verifiedDomains
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const network = this.props.network;
        const governorAddress = this.state.resolvedIdentity?.document?.meta.governorAddress;
        const stateControllerAddress = this.state.resolvedIdentity?.document?.meta.stateControllerAddress;
        return (
            <div>


                <div className="label">DID</div>
                <div className="row middle value code highlight margin-b-s">
                    <div className="margin-r-t">{this.props.did}</div>
                    <CopyButton copy={this.props.did} />
                </div>

                {this.state.resolvedIdentity?.document &&
                        !this.state.errorMessage && (
                            <Fragment>
                                <div className="margin-b-s">
                                    <div className="label">Governor</div>
                                    <div className="value code row middle">
                                        <div className="margin-r-t">
                                            <a onClick={() => {
                                                window.location.href =
                                                    // eslint-disable-next-line max-len
                                                    `/${network}/search/${governorAddress}`;
                                            }}
                                            >
                                                {governorAddress}
                                            </a>
                                        </div>
                                        <CopyButton
                                            copy={this.state.resolvedIdentity.document.meta.governorAddress}
                                        />
                                    </div>
                                </div>

                                <div className="margin-b-s">
                                    <div className="label">State Controller</div>
                                    <div className="value code row middle">
                                        <div className="margin-r-t">
                                            <a onClick={() => {
                                                // eslint-disable-next-line max-len
                                                window.location.href = `/${network}/search/${stateControllerAddress}`;
                                            }}
                                            >
                                                {stateControllerAddress}
                                            </a>
                                        </div>
                                        <CopyButton
                                            copy={stateControllerAddress}
                                        />
                                    </div>
                                </div>

                                <div className="margin-b-s">
                                    <div className="label">Linked Domains</div>
                                    <IdentityDomainResolver verifiedDomains={this.state.verifiedDomains} />
                                </div>

                            </Fragment>
                        )}

                <div className="margin-b-s">
                    <h3 className="label">DID Document</h3>


                    {!this.state.resolvedIdentity && !this.state.errorMessage && (
                    <Fragment>
                        <h3 className="margin-r-s">Resolving DID ...</h3>
                        <Spinner />
                    </Fragment>
                )}

                    {this.state.errorMessage && (
                    <div className="identity-json-container did-error">
                        <p className="margin-b-t">ಠ_ಠ </p>
                        <p className="">{this.state.errorMessage}</p>
                    </div>
                 )}

                    {this.state.resolvedIdentity && !this.state.errorMessage && (
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

                <div className="margin-b-s">
                    {this.state.resolvedIdentity && !this.state.errorMessage && (

                        <div>
                            <h3 className="label">
                                Metadata
                            </h3>

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

