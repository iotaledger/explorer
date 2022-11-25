import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { INetwork } from "../../../../models/config/INetwork";
import { CUSTOM } from "../../../../models/config/networkType";
import { PROTO } from "../../../../models/config/protocolVersion";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { NetworkService } from "../../../../services/networkService";
import Feeds from "../../../components/proto/Feeds";
import NetworkContext from "../../../context/NetworkContext";
import { LandingRouteProps } from "../../LandingRouteProps";
import AnalyticStats from "./AnalyticStats";
import EpochFeed from "./EpochFeed";
import InfoBox from "./InfoBox";
import { getDefaultLandingState, LandingState } from "./LandingState";
import "./Landing.scss";

const MAX_EPOCH_FEED_ITEMS = 10;

/**
 * Component which will show the landing page.
 */
class Landing extends Feeds<RouteComponentProps<LandingRouteProps>, LandingState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * Create a new instance of Landing.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<LandingRouteProps>) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const network: INetwork = (props.match.params.network && networkService.get(props.match.params.network)) || {
            label: "Custom network",
            network: CUSTOM,
            protocolVersion: PROTO,
            isEnabled: false
        };

        this.state = getDefaultLandingState(network);
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     * @param prevState The previous state.
     */
    public componentDidUpdate(
        prevProps: RouteComponentProps<LandingRouteProps>,
        prevState: LandingState
    ): void {
        super.componentDidUpdate(prevProps, prevState);

        if (this.props.match.params.network !== prevProps.match.params.network && this._networkConfig) {
            this.setState({ networkConfig: this._networkConfig });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            networkConfig, epochs, itemsPerSecond, confirmedItemsPerSecondPercent,
            confirmationLatency, latestMilestoneIndex, networkAnalytics, protoStats
        } = this.state;

        // const { network } = this.props.match.params;
        const { tokenInfo } = this.context;

        return (
            <div className="landing-protonet">
                <div className={classNames("header-wrapper", { "protonet": true })}>
                    <div className="inner">
                        <div className="header">
                            <div className="header--title">
                                <h2>{networkConfig.isEnabled ? "Explore network" : ""}</h2>
                                <div className="network-name"><h1>{networkConfig.label}</h1></div>
                            </div>
                            <InfoBox
                                itemsPerSecond={itemsPerSecond}
                                confirmationLatency={confirmationLatency}
                                confirmedItemsPerSecondPercent={confirmedItemsPerSecondPercent}
                            />
                        </div>
                    </div>
                    <AnalyticStats
                        analytics={networkAnalytics}
                        protoStats={protoStats}
                        circulatingSupply={networkConfig.circulatingSupply}
                        tokenInfo={tokenInfo}
                    />
                </div>
                <div className={classNames("wrapper feeds-wrapper", { "protonet": true })}>
                    <div className="inner">
                        <div className="feeds-section">
                            <div className="row wrap feeds">
                                <div className="feed section">
                                    <EpochFeed
                                        networkConfig={networkConfig}
                                        epochs={epochs}
                                        latestEpochIndex={latestMilestoneIndex}
                                    />
                                </div>
                            </div>
                            <div className="card margin-t-m">
                                <div className="card--content description">{networkConfig.description}</div>
                                {networkConfig.faucet && (
                                    <div className="card--content description">
                                        <span>Get tokens from the Faucet:</span>
                                        <a
                                            className="data-link margin-l-t"
                                            href={networkConfig.faucet}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {networkConfig.faucet}
                                        </a>
                                    </div>
                                )}
                            </div>
                            {!networkConfig.isEnabled && (
                                <div className="card margin-t-m">
                                    <div className="card--content description">
                                        {networkConfig.isEnabled === undefined
                                            ? "This network is not recognised."
                                            : "This network is currently disabled in explorer."}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * The items have been updated.
     * @param newItems The updated items.
     */
    protected itemsUpdated(newItems: IFeedItem[]): void {
        super.itemsUpdated(newItems);
        if (this._feedClient) {
            // eslint-disable-next-line no-warning-comments
            // TODO: get feed items from feed client and map to state object

            /*
            const milestones = this._feedClient.getItems()
                .filter(item => item.payloadType === "Epoch").slice(0, MAX_EPOCH_FEED_ITEMS);

            this.setState({ epochs: milestones });
             */
        }
    }
}

export default Landing;

