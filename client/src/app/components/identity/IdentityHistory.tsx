import "./IdentityHistory.scss";
import "../../../scss/layout.scss";
import React, { Component, Fragment, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IIdentityMessageWrapper } from "../../../models/identity/IIdentityMessageWrapper";
import { IdentityDiffStorageService } from "../../../services/identityDiffStorageService";
import { IdentityService } from "../../../services/identityService";
import { IdentityResolverProps } from "../../routes/IdentityResolverProps";
import Spinner from "../Spinner";
import { IdentityHistoryProps } from "./IdentityHistoryProps";
import { IdentityHistoryState } from "./IdentityHistoryState";
import IdentityJsonCompare from "./IdentityJsonCompare";
import IdentityTree from "./tree/IdentityTree";

export default class IdentityHistory extends Component<
    RouteComponentProps<IdentityResolverProps> & {version: string},
    IdentityHistoryState
> {
    constructor(props: RouteComponentProps<IdentityHistoryProps> & {version: string}) {
        super(props);

        this.state = {
            loadingHistory: false,
            historyLoaded: false,
            resolvedHistory: {},
            selectedMessage: undefined,
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
                <div className="section">
                    <div className="section--header row space-between">
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
                        <div className="card--content row history-content">
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

                    {/* --------- History Tree and JsonViewer --------- */}
                    {this.state.historyLoaded && !this.state.error && (
                        <div className="card--content row row--tablet-responsive">
                            <div className="history-tree margin-b-s">
                                <IdentityTree
                                    network={this.props.match.params.network}
                                    history={this.state.resolvedHistory}
                                    version={this.props.version}
                                    onItemClick={(selectedItem, compareWith) => {
                                        this.setState({
                                            selectedMessage: selectedItem,
                                            compareWith: compareWith
                                                ? compareWith.concat(
                                                    this.getPreviousMessages(selectedItem.parentMessageId ?? "", true)
                                                )
                                                : this.getPreviousMessages(selectedItem.messageId),
                                            selectedComparisonMessage: undefined
                                        });
                                    }}
                                    onDiffMessagesUpdate={() => {
                                        this.setState({
                                            compareWith: this.getPreviousMessages(
                                                this.state.selectedMessage?.messageId ?? ""
                                            )
                                        });
                                    }}
                                />
                            </div>
                            <IdentityJsonCompare
                                version={this.props.version}
                                network={this.props.match.params.network}
                                selectedMessage={this.state.selectedMessage}
                                compareWith={this.state.compareWith}
                                onCompareSelectionChange={message => {
                                    this.setState({
                                        selectedComparisonMessage: message
                                    });
                                }}
                                selectedComparisonMessage={this.state.selectedComparisonMessage}
                            />
                        </div>
                    )}
                </div>
            </Fragment>
        );
    }

    /**
     * @param messageId message Id of integration message
     * @param inclusive include the searched message in the result.
     * @returns a list messageId and content of all integration messages previous to the given message
     */
    private getPreviousMessages(messageId: string, inclusive = false): IIdentityMessageWrapper[] {
        const integrationChainData = this.state.resolvedHistory?.integrationChainData;
        if (!integrationChainData) {
            return [];
        }

        const index = integrationChainData.findIndex(
            (element: { messageId: string }) => element.messageId === messageId
        );

        let previousMessages: IIdentityMessageWrapper[] = [];

        let i = inclusive ? index : index + 1;

        for (i; i < integrationChainData.length; i++) {
            if (i !== index) {
                // add diffs if already loaded
                const diffs = IdentityDiffStorageService.instance.getDiffMessages(integrationChainData[i].messageId);
                if (diffs) {
                    previousMessages = previousMessages.concat(diffs);
                }
            }
            // add integrations message
            const msg: IIdentityMessageWrapper = {
                document: integrationChainData[i].document,
                isDiff: false,
                message: integrationChainData[i].document,
                messageId: integrationChainData[i].messageId
            };

            previousMessages.push(msg);
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
            this.props.match.params.network,
            this.props.version
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
                selectedMessage: {
                    messageId: res.integrationChainData?.[0].messageId,
                    message: res.integrationChainData?.[0].document,
                    document: res.integrationChainData?.[0].document,
                    isDiff: false
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
