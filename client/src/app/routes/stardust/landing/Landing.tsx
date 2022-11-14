import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { isShimmerNetwork } from "../../../../helpers/networkHelper";
import { INetwork } from "../../../../models/config/INetwork";
import { CUSTOM } from "../../../../models/config/networkType";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { NetworkService } from "../../../../services/networkService";
import Feeds from "../../../components/stardust/Feeds";
import NetworkContext from "../../../context/NetworkContext";
import { LandingRouteProps } from "../../LandingRouteProps";
import AnalyticStats from "./AnalyticStats";
import InfoBox from "./InfoBox";
import { getDefaultLandingState, LandingState } from "./LandingState";
import MilestoneFeed from "./MilestoneFeed";
import "./Landing.scss";

const MAX_MILESTONE_ITEMS = 15;

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
            protocolVersion: STARDUST,
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
            networkConfig, marketCapCurrency, priceCurrency,
            milestones, itemsPerSecond, confirmedItemsPerSecondPercent,
            latestMilestoneIndex, networkAnalytics, shimmerClaimed
        } = this.state;

        const { network } = this.props.match.params;
        const { tokenInfo } = this.context;
        const isShimmer = isShimmerNetwork(network);

        return (
            <div className="landing-stardust">
                <div className={classNames("header-wrapper", { "shimmer": isShimmer })}>
                    <div className="inner">
                        <div className="header">
                            <div className="header--title">
                                <h2>{networkConfig.isEnabled ? "Explore network" : ""}</h2>
                                <div className="network-name"><h1>{networkConfig.label}</h1></div>
                            </div>
                            <InfoBox
                                itemsPerSecond={itemsPerSecond}
                                confirmedItemsPerSecondPercent={confirmedItemsPerSecondPercent}
                                marketCapCurrency={marketCapCurrency}
                                priceCurrency={priceCurrency}
                                isShimmer={isShimmer}
                                showMarket={networkConfig.showMarket ?? false}
                            />
                        </div>
                    </div>
                    <AnalyticStats
                        analytics={networkAnalytics}
                        shimmerClaimed={shimmerClaimed}
                        circulatingSupply={networkConfig.circulatingSupply}
                        tokenInfo={tokenInfo}
                    />
                </div>
                <div className={classNames("wrapper feeds-wrapper", { "shimmer": isShimmer })}>
                    <div className="inner">
                        <div className="feeds-section">
                            <div className="row wrap feeds">
                                <div className="feed section">
                                    <MilestoneFeed
                                        networkConfig={networkConfig}
                                        milestones={milestones}
                                        latestMilestoneIndex={latestMilestoneIndex}
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
            </div >
        );
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void {
        if (this._currencyData) {
            this.setState({
                marketCapCurrency:
                    this._currencyData.coinStats?.iota?.marketCap ?
                        this._currencyService.convertFiatBase(
                            this._currencyData.coinStats.iota.marketCap,
                            this._currencyData,
                            true,
                            2,
                            undefined,
                            true)
                        : "--",
                priceCurrency: this._currencyData.coinStats?.iota?.price ?
                    this._currencyService.convertFiatBase(
                        this._currencyData.coinStats.iota.price,
                        this._currencyData,
                        true,
                        3,
                        8)
                    : "--"
            });
        }
    }

    /**
     * The items have been updated.
     * @param newItems The updated items.
     */
    protected itemsUpdated(newItems: IFeedItem[]): void {
        super.itemsUpdated(newItems);
        if (this._feedClient) {
            const milestones = this._feedClient.getItems()
                .filter(item => item.payloadType === "MS").slice(0, MAX_MILESTONE_ITEMS);

            this.setState({
                milestones
            });
        }
    }
}

export default Landing;

