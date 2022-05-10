import { UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { RouteBuilder } from "../../../helpers/routeBuilder";
import { OG } from "../../../models/db/protocolVersion";
import { IFeedItem } from "../../../models/feed/IFeedItem";
import LineChart from "../LineChart";
import "./SidePanel.scss";
import { SidePanelRouteProps } from "../SidePanelRouteProps";
import { SidePanelState } from "../SidePanelState";
import Feeds from "./Feeds";

/**
 * Component which will show the side panel component for chrysalis.
 */
class SidePanel extends Feeds<RouteComponentProps<SidePanelRouteProps>, SidePanelState> {
    /**
     * Create a new instance of SidePanel.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<SidePanelRouteProps>) {
        super(props);

        this.state = {
            itemsPerSecond: "--",
            confirmedItemsPerSecond: "--",
            confirmedItemsPerSecondPercent: "--",
            itemsPerSecondHistory: [],
            items: [],
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
                            {this._networkConfig?.protocolVersion === OG ? "Transactions" : "Messages"} Per Second
                        </div>
                        <div className="card--value card--value__large padding-t-s">
                            {this.state.itemsPerSecond} / {this.state.confirmedItemsPerSecond}
                        </div>
                        <LineChart
                            values={this.state.itemsPerSecondHistory}
                        />
                    </div>
                    <div className="card--section feed">
                        <div className="card--label card--label__underline">
                            Milestones
                        </div>
                        {this.state.milestones.slice(0, 5).map(item => (
                            <div className="row feed-item" key={item.id}>
                                <span className="feed-item--value">{item.milestoneIndex}</span>
                                <Link
                                    className="feed-item--hash"
                                    to={RouteBuilder.buildMilestone(this._networkConfig, item)}
                                >
                                    {item.id}
                                </Link>
                            </div>
                        ))}
                        <div className="card--sep" />
                    </div>
                    <div className="card--section feed">
                        <div className="card--label card--label__underline">
                            {this._networkConfig?.protocolVersion === OG ? "Transactions" : "Messages"}
                        </div>
                        {this.state.items.map(item => (
                            <div className="row feed-item" key={item.id}>
                                {item.value !== undefined && (
                                    <span className="feed-item--value">
                                        {UnitsHelper.formatBest(item.value)}
                                    </span>
                                )}
                                {item.value === undefined && (
                                    <span className="feed-item--value">
                                        {item.payloadType}
                                    </span>
                                )}
                                <Link
                                    className="feed-item--hash"
                                    to={RouteBuilder.buildItem(this._networkConfig, item.id)}
                                >
                                    {item.id}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * The items have been updated.
     * @param items The updated items.
     */
    protected itemsUpdated(items: IFeedItem[]): void {
        this.setState({ items: items.concat(this.state.items).slice(0, 5) });
    }
}

export default SidePanel;
