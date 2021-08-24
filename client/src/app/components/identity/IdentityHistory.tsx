import React, { Component, Fragment, ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IdentityService } from "../../../services/identityService";
import JsonViewer from "../JsonViewer";
import { IdentityHistoryState } from "./IdentityHisotyState";
import "./IdentityHistory.scss";
import "../../../scss/layout.scss";

import { IdentityHistoryProps } from "./IdentityHistoryProps";
import IdentityTree from "./tree/IdentityTree";

export default class IdentityHistory extends Component<IdentityHistoryProps, IdentityHistoryState> {
    constructor(props: IdentityHistoryProps) {
        super(props);

        this.state = {
            historyLoaded: false,
            resolvedHistory: {},
            selectedMessageId: "",
            contentOfSelectedMessage: undefined
        };
    }

    public componentDidMount(): void {
        // this.setContentOfSelectedMessage();
    }

    public render(): ReactNode {
        return (
            <Fragment>
                {!this.state.historyLoaded && (
                    <button
                        className="load-history"
                        onClick={async () => {
                            await this.loadHistory();
                        }}
                        type="button"
                    >
                        {" "}
                        Load history
                    </button>
                )}
                {this.state.historyLoaded && (
                    <div className="card history-content">
                        <div className="card--header card--header">
                            <h2>History</h2>
                        </div>
                        <div className="card--content row">
                            <div className="row wrap middle margin-b-s row--tablet-responsive">
                                <div className="tree">
                                    <IdentityTree
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
                    </div>
                )}
            </Fragment>
        );
    }

    private async loadHistory(): Promise<void> {
        const res = await ServiceFactory.get<IdentityService>("identity").resolveHistory(
            this.props.did,
            this.props.network
        );

        console.log(res);

        if (typeof res.error === "object") {
            res.error = JSON.stringify(res.error);
        }

        this.setState({
            historyLoaded: true,
            resolvedHistory: res
        });
    }

    private setContentOfSelectedMessage(content: unknown) {
        this.setState({
            contentOfSelectedMessage: content
        });
    }
}
