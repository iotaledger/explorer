import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { UnitsHelper } from "../../helpers/unitsHelper";
import Feeds from "./Feeds";
import { FeedsState } from "./FeedsState";
import LineChart from "./LineChart";
import "./SidePanel.scss";
import { SidePanelRouteProps } from "./SidePanelRouteProps";

/**
 * Component which will show the side panel component.
 */
class SidePanel extends Feeds<RouteComponentProps<SidePanelRouteProps>, FeedsState> {
    /**
     * Create a new instance of SidePanel.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<SidePanelRouteProps>) {
        super(props);

        this.state = {
            transactionsPerSecond: "--",
            transactionsPerSecondHistory: [],
            transactions: [],
            milestones: [],
            currency: "USD",
            currencies: []
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="side-panel card">
                <div className="card--header">
                    <h2>Stats</h2>
                </div>
                <div className="card--sections">
                    <div className="card--section card--section__highlight">
                        <div className="card--label card--label__highlight padding-t-s">
                            Transactions Per Second
                        </div>
                        <div className="card--value card--value__large padding-t-s">
                            {this.state.transactionsPerSecond}
                        </div>
                        <LineChart
                            values={this.state.transactionsPerSecondHistory}
                        />
                    </div>
                    <div className="card--section feed">
                        <div className="card--label card--label__underline">
                            Milestones
                        </div>
                        {this.state.milestones.slice(0, 5).map(tx => (
                            <div className="row feed-item" key={tx.hash}>
                                <span className="feed-item--value">{tx.milestoneIndex}</span>
                                <Link
                                    className="feed-item--hash"
                                    to={`/${this.props.match.params.network}/transaction/${tx.hash}`}
                                >
                                    {tx.hash}
                                </Link>
                            </div>
                        ))}
                        <div className="card--sep" />
                    </div>
                    <div className="card--section feed">
                        <div className="card--label card--label__underline">
                            Transactions
                        </div>
                        {this.state.transactions.slice(0, 5).map(tx => (
                            <div className="row feed-item" key={tx.hash}>
                                <span className="feed-item--value">
                                    {UnitsHelper.formatBest(tx.value)}
                                </span>
                                <Link
                                    className="feed-item--hash"
                                    to={`/${this.props.match.params.network}/transaction/${tx.hash}`}
                                >
                                    {tx.hash}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default SidePanel;
