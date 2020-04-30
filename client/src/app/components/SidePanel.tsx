import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UnitsHelper } from "../../helpers/unitsHelper";
import { NetworkProps } from "../NetworkProps";
import Feeds from "./Feeds";
import { FeedsState } from "./FeedsState";
import LineChart from "./LineChart";
import "./SidePanel.scss";

/**
 * Component which will show the side panel component.
 */
class SidePanel extends Feeds<NetworkProps, FeedsState> {
    /**
     * Create a new instance of SidePanel.
     * @param props The props.
     */
    constructor(props: NetworkProps) {
        super(props);

        this.state = {
            transactionsPerSecond: "--",
            transactionsPerSecondHistory: [],
            transactions: [],
            milestones: [],
            currency: "USD",
            currencies: [],
            formatFull: false
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
                <div className="card--label card--label__highlight padding-t-s">
                    Transactions Per Second
                </div>
                <div className="card--value card--value__highlight padding-t-s padding-b-s">
                    {this.state.transactionsPerSecond}
                </div>
                <LineChart
                    values={this.state.transactionsPerSecondHistory}
                />
                <div className="card--label card--label__underline margin-t-s">
                    Milestones
                </div>
                {this.state.milestones.slice(0, 5).map(tx => (
                    <div className="row feed-item" key={tx.hash}>
                        <span className="feed-item--value">{tx.milestoneIndex}</span>
                        <Link
                            className="feed-item--hash"
                            to={`/${this.props.networkConfig.network}/transaction/${tx.hash}`}
                        >
                            {tx.hash}
                        </Link>
                    </div>
                ))}
                <div className="card--sep" />
                <div className="card--label card--label__underline margin-t-s">
                    Transactions
                </div>
                {this.state.transactions.slice(0, 5).map(tx => (
                    <div className="row feed-item" key={tx.hash}>
                        <span className="feed-item--value">
                            {UnitsHelper.formatBest(tx.value)}
                        </span>
                        <Link
                            className="feed-item--hash"
                            to={`/${this.props.networkConfig.network}/transaction/${tx.hash}`}
                        >
                            {tx.hash}
                        </Link>
                    </div>
                ))}
            </div>
        );
    }
}

export default SidePanel;
