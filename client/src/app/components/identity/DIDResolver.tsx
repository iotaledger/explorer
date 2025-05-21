import * as identity from "@iota/identity-wasm/web";
import {
    DomainLinkageConfiguration,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EdDSAJwsVerifier,
    JwtCredentialValidationOptions,
    JwtDomainLinkageValidator,
    LinkedDomainService,
    IJwsVerifier,
} from "@iota/identity-wasm/web";
import { p256 } from "@noble/curves/p256";
import React, { Fragment, useEffect, useState } from "react";
import DIDDomainResolver from "./domains/DIDDomainResolver";
import { DIDResolverProps } from "./DIDResolverProps";
import { ServiceFactory } from "~factories/serviceFactory";
import { IdentityService } from "~services/identityService";
import "./DIDResolver.scss";
import CopyButton from "../CopyButton";
import JsonViewer from "../JsonViewer";
import Spinner from "../Spinner";
import { IDIDResolverResponse } from "~/models/api/IDIDResolverResponse";

const IdentityStardustResolver: React.FC<DIDResolverProps> = ({ resolvedDID, network }) => {
    const [DID, setDID] = useState<string>("");
    const [governorAddress, setGovernorAddress] = useState<string>("");
    const [stateControllerAddress, setStateControllerAddress] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [verifiedDomains, setVerifiedDomains] = useState<Map<string, Promise<void>>>(new Map());

    useEffect(() => {
        if (!resolvedDID?.document) {
            return;
        }

        setDID((resolvedDID.document.doc.id as string) ?? "");
        setGovernorAddress(resolvedDID.document?.meta.governorAddress ?? "");
        setStateControllerAddress(resolvedDID.document?.meta.stateControllerAddress ?? "");
        setErrorMessage(resolvedDID.error ?? "");

        constructVerifiedDomains(resolvedDID).then((newVerifiedDomains) => {
            setVerifiedDomains(newVerifiedDomains);
        });
    }, [resolvedDID]);

    return (
        <div>
            <div className="label">DID</div>
            <div className="row middle value code highlight margin-b-s">
                <div className="margin-r-t">{DID}</div>
                <CopyButton copy={DID} />
            </div>

            {resolvedDID?.document && !errorMessage && (
                <Fragment>
                    <div className="margin-b-s">
                        <div className="label">Governor</div>
                        <div className="value code row middle">
                            <div className="margin-r-t">
                                <a
                                    onClick={() => {
                                        window.location.href =
                                            // eslint-disable-next-line max-len
                                            `/${network}/search/${governorAddress}`;
                                    }}
                                >
                                    {governorAddress}
                                </a>
                            </div>
                            <CopyButton copy={governorAddress} />
                        </div>
                    </div>

                    <div className="margin-b-s">
                        <div className="label">State Controller</div>
                        <div className="value code row middle">
                            <div className="margin-r-t">
                                <a
                                    onClick={() => {
                                        // eslint-disable-next-line max-len
                                        window.location.href = `/${network}/search/${stateControllerAddress}`;
                                    }}
                                >
                                    {stateControllerAddress}
                                </a>
                            </div>
                            <CopyButton copy={stateControllerAddress} />
                        </div>
                    </div>

                    <div className="margin-b-s">
                        <div className="label">Linked Domains</div>
                        <DIDDomainResolver verifiedDomains={verifiedDomains} />
                    </div>
                </Fragment>
            )}

            <div className="margin-b-s">
                <h3 className="label">DID Document</h3>

                {!resolvedDID && !errorMessage && (
                    <Fragment>
                        <h3 className="margin-r-s">Resolving DID ...</h3>
                        <Spinner />
                    </Fragment>
                )}

                {errorMessage && (
                    <div className="identity-json-container did-error">
                        <p className="margin-b-t">ಠ_ಠ </p>
                        <p className="">{errorMessage}</p>
                    </div>
                )}

                {resolvedDID && !errorMessage && (
                    <div
                        className="
                            json-wraper-stardust-identity
                            card--value
                            card--value-textarea
                            card--value-textarea__json
                        "
                    >
                        <JsonViewer json={JSON.stringify(resolvedDID?.document?.doc, null, 4)} />
                    </div>
                )}
            </div>

            <div className="margin-b-s">
                {resolvedDID && !errorMessage && (
                    <div>
                        <h3 className="label">Metadata</h3>

                        <div
                            className="
                                    json-wraper-stardust-identity
                                    card--value
                                    card--value-textarea
                                    card--value-textarea__json
                                "
                        >
                            <JsonViewer json={JSON.stringify(resolvedDID?.document?.meta, null, 3)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
// }
export default IdentityStardustResolver;

class EcDSAVerifier implements IJwsVerifier {
    constructor() {}
    verify(alg: identity.JwsAlgorithm, signingInput: Uint8Array, decodedSignature: Uint8Array, publicKey: identity.Jwk) {
        // eslint-disable-next-line no-console
        console.log(publicKey);
        p256.verify(decodedSignature, signingInput, new Uint8Array());
    }
}

async function constructVerifiedDomains(resolvedDID: IDIDResolverResponse): Promise<Map<string, Promise<void>>> {
    const newVerifiedDomains = new Map<string, Promise<void>>();
    const origin = window?.location?.origin ?? "";
    await ServiceFactory.get<IdentityService>("identity").initLibrary(origin + "/wasm/identity_wasm_bg.wasm");

    const didDocument = identity.IotaDocument.fromJSON(resolvedDID.document);
    // Get the Linked Domain Services from the DID Document.
    const linkedDomainServices = didDocument
        .service()
        .filter((service) => LinkedDomainService.isValid(service))
        .map((service) => LinkedDomainService.fromService(service));

    for (const entry of linkedDomainServices) {
        for (const domain of entry.domains()) {
            newVerifiedDomains.set(
                domain,
                new Promise((resolve, reject) => {
                    // Note that according to the specs, the DID Configuration resource must exist
                    // at the origin's root, Well-Known Resource directory.
                    const configurationUrl = new URL("/.well-known/did-configuration.json", domain);

                    return fetch(configurationUrl)
                        .then((response) => {
                            return response
                                .json()
                                .then((jsonResponse) => {
                                    let parsedConfigurationResource;

                                    try {
                                        parsedConfigurationResource = DomainLinkageConfiguration.fromJSON(jsonResponse);

                                        try {
                                            new JwtDomainLinkageValidator(new EcDSAVerifier()).validateLinkage(
                                                didDocument,
                                                parsedConfigurationResource,
                                                domain,
                                                new JwtCredentialValidationOptions(),
                                            );

                                            // all good
                                            resolve();
                                        } catch (err) {
                                            // return the error from the library
                                            reject(err);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        reject(new Error(`Domain Linkage credential invalid domain ${domain}`));
                                    }
                                })
                                .catch((err) => {
                                    console.error(err);
                                    reject(new Error(`could not parse configuration from domain ${domain}`));
                                });
                        })
                        .catch((err) => {
                            console.error(err);
                            reject(new Error(`could not fetch configuration from ${domain}, this could be a CORS error`));
                        });
                }),
            );
        }
    }

    return newVerifiedDomains;
}
