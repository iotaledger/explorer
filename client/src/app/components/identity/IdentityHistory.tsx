import "./IdentityHistory.scss";
import "../../../scss/layout.scss";
import React, { Component, Fragment, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IdentityService } from "../../../services/identityService";
import { IdentityResolverProps } from "../../routes/IdentityResolverProps";
import Spinner from "../Spinner";
import { IdentityHistoryProps } from "./IdentityHistoryProps";
import { IdentityHistoryState } from "./IdentityHistoryState";
import IdentityJsonCompare from "./IdentityJsonCompare";
import IdentityTree from "./tree/IdentityTree";
import { IdentityHelper } from "../../../helpers/identityHelper";
import { IntegrationMessage } from "../../../models/api/IIdentityDidHistoryResponse";

export default class IdentityHistory extends Component<
    RouteComponentProps<IdentityResolverProps>,
    IdentityHistoryState
> {
    constructor(props: RouteComponentProps<IdentityHistoryProps>) {
        super(props);

        this.state = {
            loadingHistory: false,
            historyLoaded: false,
            resolvedHistory: {},
            selectedMessageId: "",
            contentOfSelectedMessage: { document: {}, message: {} },
            error: undefined,
            compareWith: []
        };
    }

    public async componentDidMount(): Promise<void> {
        if (this.isDebugView() && !this.state.historyLoaded) {
            await this.loadIntegrationHistory();
        }
    }

    public render(): ReactNode {
        return (
            <Fragment>
                {/* --------- History Card --------- */}
                <div className="card history-content">
                    <div className="card--header card--header history-header">
                        <h2>History</h2>
                        {/* --------- Load History Button --------- */}
                        {!this.state.historyLoaded && !this.state.loadingHistory && !this.state.error && (
                            <div>
                                <button
                                    className="load-history-button"
                                    onClick={async () => {
                                        await this.loadIntegrationHistory();
                                    }}
                                    type="button"
                                >
                                    Load History
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --------- Resolving History Spinner --------- */}
                    {this.state.loadingHistory && (
                        <div className="card--content row">
                            <h3 className="margin-r-s">Resolving History ...</h3>
                            <Spinner />
                        </div>
                    )}

                    {/* --------- Error Case --------- */}
                    {this.state.error && (
                        <div className="card--content">
                            <p className="margin-r-s history-error">Something went wrong!</p>
                            <p className="margin-r-s history-error">{this.state.error}</p>
                        </div>
                    )}

                    {/* --------- History Tree and JsonVeiwer --------- */}
                    {this.state.historyLoaded && !this.state.error && (
                        <div className="card--content row row--tablet-responsive">
                            <div className="history-tree margin-b-s">
                                <IdentityTree
                                    network={this.props.match.params.network}
                                    history={this.state.resolvedHistory}
                                    onItemClick={(selectedItem, compareWith) => {
                                        this.setState({
                                            contentOfSelectedMessage: selectedItem.content,
                                            selectedMessageId: selectedItem.messageId,
                                            compareWith: compareWith
                                                ? compareWith
                                                : this.getPreviousMessages(selectedItem.messageId),
                                            selectedComparedContent: undefined,
                                            selectedComparedMessageId: undefined
                                        });
                                    }}
                                />
                            </div>
                            <IdentityJsonCompare
                                network={this.props.match.params.network}
                                messageId={this.state.selectedMessageId ?? ""}
                                content={this.state.contentOfSelectedMessage}
                                compareWith={this.state.compareWith}
                                onCompareSelectionChange={(messageId, content) => {
                                    this.setState({
                                        selectedComparedMessageId: messageId,
                                        selectedComparedContent: content
                                    });
                                }}
                                selectedComparedContent={{
                                    document: this.state.selectedComparedContent?.document,
                                    message: this.state.selectedComparedContent?.message
                                }}
                                selectedComparedMessageId={this.state.selectedComparedMessageId}
                            />
                        </div>
                    )}
                </div>
            </Fragment>
        );
    }

    /**
     * @param messageId message Id of integration message
     * @returns a list messageId and content of all integration mesages previous to the given message
     */
    private getPreviousMessages(
        messageId: string
    ): { messageId: string; content: { document: unknown; message: unknown } }[] {
        const integrationChainData = this.state.resolvedHistory?.integrationChainData;
        if (!integrationChainData) {
            return [];
        }

        const index = integrationChainData.findIndex(
            (element: { messageId: string }) => element.messageId === messageId
        );

        const previousMessages = [];
        for (let i = index + 1; i < integrationChainData.length; i++) {
            previousMessages.push({
                messageId: integrationChainData[i].messageId,
                content: {
                    message: integrationChainData[i].document,
                    document: IdentityHelper.getDocumentFromIntegrationMsg(integrationChainData[i].document)
                }
            });
        }
        return previousMessages;
    }

    private async loadIntegrationHistory(): Promise<void> {
        // update URL to include debugview=true
        window.history.replaceState(
            null,
            "",
            `/${this.props.match.params.network}/identity-resolver/${this.props.match.params.did}?debugview=true`
        );

        if (!this.props.match.params.did) {
            return;
        }

        this.setState({ loadingHistory: true });

        const res = await ServiceFactory.get<IdentityService>("identity").resolveHistory(
            this.props.match.params.did,
            this.props.match.params.network
        );

        // handle if response contains Error.
        if (res.error) {
            if (typeof res.error === "object") {
                res.error = JSON.stringify(res.error);
            }
            this.setState({
                error: res.error,
                loadingHistory: false
            });
            return;
        }

        if (res.integrationChainData) {
            // reverse the order (first message becomes the newest)
            res.integrationChainData = res.integrationChainData?.reverse();

            this.setState({
                historyLoaded: true,
                resolvedHistory: res,
                loadingHistory: false,
                selectedMessageId: res.integrationChainData?.[0].messageId,
                contentOfSelectedMessage: {
                    message: res.integrationChainData?.[0].document,
                    document: IdentityHelper.getDocumentFromIntegrationMsg(res.integrationChainData?.[0].document)
                }
            });

            this.setState({
                compareWith: this.getPreviousMessages(res.integrationChainData?.[0].messageId ?? "")
            });
        }
    }

    /**
     * @returns true if URL contains parameter debugview=true
     */
    private isDebugView() {
        const params = new URLSearchParams(document.location.search.slice(1));
        return params.get("debugview") === "true";
    }
}
