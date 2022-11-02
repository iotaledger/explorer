import { IMessageMetadata } from "@iota/iota.js";
import React, { Fragment, ReactNode } from "react";
import { HiDownload } from "react-icons/hi";
import { RouteComponentProps } from "react-router-dom";
import contentMessage from "../../../assets/modals/identity-resolver/content.json";
import welcomeMessage from "../../../assets/modals/identity-resolver/welcome.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DownloadHelper } from "../../../helpers/downloadHelper";
import { CHRYSALIS } from "../../../models/config/protocolVersion";
import { TangleStatus } from "../../../models/tangleStatus";
import { ChrysalisTangleCacheService } from "../../../services/chrysalis/chrysalisTangleCacheService";
import { IdentityDiffStorageService } from "../../../services/identityDiffStorageService";
import { IdentityService } from "../../../services/identityService";
import AsyncComponent from "../AsyncComponent";
import "./IdentityChrysalisResolver.scss";
import MessageTangleState from "../chrysalis/MessageTangleState";
import CopyButton from "../CopyButton";
import JsonViewer from "../JsonViewer";
import Modal from "../Modal";
import Spinner from "../Spinner";
import { IdentityChrysalisResolverProps } from "./IdentityChrysalisResolverProps";
import { IdentityChrysalisResolverState } from "./IdentityChrysalisResolverState";
import IdentityHistory from "./IdentityHistory";
import IdentityMessageIdOverview from "./IdentityMsgIdOverview";

class IdentityChrysalisResolver extends AsyncComponent<
    RouteComponentProps<IdentityChrysalisResolverProps>,
    IdentityChrysalisResolverState
> {
    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: ChrysalisTangleCacheService;

    /**
     * placeholder when messageId is not available.
     */
    private readonly EMPTY_MESSAGE_ID = "0".repeat(64);

    constructor(props: RouteComponentProps<IdentityChrysalisResolverProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<ChrysalisTangleCacheService>(`tangle-cache-${CHRYSALIS}`);

        this.state = {
            isIdentityResolved: false,
            resolvedIdentity: undefined,
            did: props.match.params.did,
            error: false,
            errorMessage: "",
            metadata: undefined,
            messageTangleStatus: "pending",
            resolvedHistory: undefined,
            historyError: false,
            version: undefined
        };
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (!this.state.did) {
            return;
        }

        const res = await ServiceFactory.get<IdentityService>("identity").resolveIdentity(
            this.state.did,
            this.props.match.params.network
        );

        if (typeof res.error === "object") {
            res.error = JSON.stringify(res.error);
        }

        if (res.error) {
            this.setState({
                error: true,
                errorMessage: res.error
            });
            return;
        }

        if (res.document) {
            this.setState({
                resolvedIdentity: res,
                isIdentityResolved: true,
                latestMessageId: res.messageId ?? undefined,
                version: res.version
            });

            await this.updateMessageDetails(res.messageId ?? "");
        }
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
                <div>
                    {this.state.version && this.state.version === "legacy" && (
                        <div className="section">
                            <div className="legacy-method">
                                <span>
                                    This DID was created by a deprecated version of the identity
                                    {" "}
                                    library. If this is your DID you can recreate it using the
                                    {" "}
                                </span>
                                <a
                                    href="https://github.com/iotaledger/identity.rs/releases"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    latest version
                                </a>.
                            </div>
                        </div>
                    )}
                    <div className="section">
                        <div className="section--header row space-between">
                            <div className="row row--tablet-responsive middle space-between w100">
                                <h2>General</h2>
                                {!this.state.error &&
                                    !(this.state.latestMessageId === this.EMPTY_MESSAGE_ID) && (
                                        <MessageTangleState
                                            network={this.props.match.params.network}
                                            status={this.state.messageTangleStatus}
                                            milestoneIndex={
                                                this.state.metadata?.referencedByMilestoneIndex ??
                                                this.state.metadata?.milestoneIndex
                                            }
                                            onClick={this.state.metadata?.referencedByMilestoneIndex
                                                ? (messageId: string) => this.props.history.push(
                                                    `/${this.props.match.params.network
                                                    }/search/${messageId}`)
                                                : undefined}
                                        />
                                    )}
                            </div>

                        </div>
                        <div className="section--data">
                            <div className="label">DID</div>
                            <div className="row middle value code highlight margin-b-s">
                                <div className="margin-r-t">{this.state.did}</div>
                                <CopyButton copy={this.state.did} />
                            </div>
                            {this.state.resolvedIdentity &&
                                !this.state.error &&
                                this.state.resolvedIdentity?.messageId !==
                                this.EMPTY_MESSAGE_ID && (
                                    <Fragment>
                                        <div className="label">Latest Message Id</div>
                                        <div className="value code row middle">
                                            <div className="margin-r-t">
                                                {this.state.resolvedIdentity?.messageId}
                                            </div>
                                            <CopyButton
                                                copy={this.state.resolvedIdentity?.messageId}
                                            />
                                        </div>
                                    </Fragment>
                                )}
                        </div>
                    </div>

                    <div className="section">
                        <div className="section--header">
                            <h2>Content
                                <Modal icon="info" data={contentMessage} />
                            </h2>
                        </div>
                        <div className="section--data">
                            <div className="row middle margin-b-s row--tablet-responsive">
                                {!this.state.isIdentityResolved && !this.state.error && (
                                    <React.Fragment>
                                        <h3 className="margin-r-s">Resolving DID ...</h3>
                                        <Spinner />
                                    </React.Fragment>
                                )}

                                {this.state.resolvedIdentity?.document && (
                                    <div className="w100">
                                        <div className="identity-json-header">
                                            <div>
                                                <IdentityMessageIdOverview
                                                    status="integration"
                                                    messageId={
                                                        this.state.resolvedIdentity.messageId
                                                    }
                                                    onClick={() => {
                                                        this.props.history.push(
                                                            // eslint-disable-next-line max-len
                                                            `/${this.props.match.params.network}/message/${this.state.resolvedIdentity?.messageId}`
                                                        );
                                                    }}
                                                />
                                            </div>

                                            <a
                                                href={DownloadHelper.createJsonDataUrl(
                                                    this.state.resolvedIdentity.document
                                                )}
                                                download={DownloadHelper.filename(
                                                    this.state.resolvedIdentity
                                                        .messageId ?? "did",
                                                    "json"
                                                )}
                                                role="button"
                                            >
                                                <HiDownload />
                                            </a>
                                        </div>

                                        <div
                                            className="
                                                            json-wraper
                                                            card--value
                                                            card--value-textarea
                                                            card--value-textarea__json
                                                            "
                                        >
                                            <JsonViewer
                                                json={JSON.stringify(
                                                    this.state.resolvedIdentity.document.doc,
                                                    null,
                                                    4
                                                )}
                                            />
                                        </div>
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

                    {this.state.isIdentityResolved &&
                        this.state.version &&
                        <IdentityHistory version={this.state.version} {...this.props} />}
                </div>
            </div>
        );
    }

    private async updateMessageDetails(msgId: string): Promise<void> {
        if (msgId === this.EMPTY_MESSAGE_ID) {
            return;
        }
        const details = await this._tangleCacheService.messageDetails(this.props.match.params.network, msgId);

        this.setState({
            metadata: details?.metadata,
            messageTangleStatus: this.calculateStatus(details?.metadata)
        });

        if (!details?.metadata?.referencedByMilestoneIndex) {
            this._timerId = setTimeout(async () => {
                await this.updateMessageDetails(msgId);
            }, 9999);
        }
    }

    /**
     * Calculate the status for the message.
     * @param metadata The metadata to calculate the status from.
     * @returns The message status.
     */
    private calculateStatus(metadata?: IMessageMetadata): TangleStatus {
        let messageTangleStatus: TangleStatus = "unknown";

        if (metadata) {
            if (metadata.milestoneIndex) {
                messageTangleStatus = "milestone";
            } else if (metadata.referencedByMilestoneIndex) {
                messageTangleStatus = "referenced";
            } else {
                messageTangleStatus = "pending";
            }
        }

        return messageTangleStatus;
    }
}

export default IdentityChrysalisResolver;
