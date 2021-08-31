import React, { Component, Fragment, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IdentityService } from "../../../services/identityService";
import JsonViewer from "../JsonViewer";
import { IdentityHistoryState } from "./IdentityHisotyState";
import "./IdentityHistory.scss";
import "../../../scss/layout.scss";

import { IdentityHistoryProps } from "./IdentityHistoryProps";
import IdentityTree from "./tree/IdentityTree";
import { IdentityResolverProps } from "../../routes/IdentityResolverProps";
import Spinner from "../Spinner";
import ReactDiffViewer from "react-diff-viewer";

export default class IdentityHistory extends Component<
    RouteComponentProps<IdentityResolverProps>,
    IdentityHistoryState
> {
    private readonly oldCode = `
const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`;

    private readonly newCode = `
const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`;

    constructor(props: RouteComponentProps<IdentityHistoryProps>) {
        super(props);

        this.state = {
            loadingHistory: false,
            historyLoaded: false,
            resolvedHistory: {},
            selectedMessageId: "",
            contentOfSelectedMessage: undefined
        };
    }

    public async componentDidMount(): Promise<void> {
        if (this.isDebugView() && !this.state.historyLoaded) {
            await this.loadHistory();
        }
    }

    public render(): ReactNode {
        return (
            <Fragment>
                {!this.state.historyLoaded && !this.state.loadingHistory && (
                    <button
                        className="load-history"
                        onClick={async () => {
                            await this.loadHistory();
                        }}
                        type="button"
                    >
                        {" "}
                        Show History 🡫
                    </button>
                )}

                {(this.state.historyLoaded || this.state.loadingHistory) && (
                    <div className="card history-content">
                        <div className="card--header card--header">
                            <h2>History</h2>
                        </div>

                        {this.state.loadingHistory && (
                            <div className="card--content row">
                                <h3 className="margin-r-s">Resolving History ...</h3>
                                <Spinner />
                            </div>
                        )}

                        {this.state.historyLoaded && (
                            <div className="card--content row">
                                <div className="row wrap middle margin-b-s row--tablet-responsive">
                                    <div className="tree">
                                        <IdentityTree
                                            network={this.props.match.params.network}
                                            history={this.state.resolvedHistory}
                                            onItemClick={(messageId, content) => {
                                                this.setContentOfSelectedMessage(content);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    className="
                                    card--value
                                    card--value-textarea
                                    card--value-textarea__json w100
                                    margin-l-s"
                                >
                                    <JsonViewer json={JSON.stringify(this.state.contentOfSelectedMessage, null, 4)} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <ReactDiffViewer
                    oldValue={JSON.stringify(this.state.contentOfSelectedMessage, null, 4)}
                    newValue={JSON.stringify(this.state.contentOfSelectedMessage, null, 4)}
                    splitView={false}
                    showDiffOnly={false}
                    hideLineNumbers={true}
                />
            </Fragment>
        );
    }

    private async loadHistory(): Promise<void> {
        window.history.replaceState(
            null,
            "",
            `/${this.props.match.params.network}/identity-resolver/${this.props.match.params.did}?debugview=true`
        );

        this.setState({ loadingHistory: true });

        if (!this.props.match.params.did) {
            return;
        }
        const res = await ServiceFactory.get<IdentityService>("identity").resolveHistory(
            this.props.match.params.did,
            this.props.match.params.network
        );

        console.log(res);

        if (typeof res.error === "object") {
            res.error = JSON.stringify(res.error);
        }

        this.setState({
            historyLoaded: true,
            resolvedHistory: res,
            loadingHistory: false
        });
    }

    private setContentOfSelectedMessage(content: unknown) {
        this.setState({
            contentOfSelectedMessage: content
        });
    }

    private isDebugView() {
        const params = new URLSearchParams(document.location.search.slice(1));
        return params.get("debugview") === "true";
    }
}
