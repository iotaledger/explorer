import classNames from "classnames";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { isShimmerNetwork } from "../../../../helpers/networkHelper";
import { NumberHelper } from "../../../../helpers/numberHelper";
import { RouteBuilder } from "../../../../helpers/routeBuilder";
import { INetwork } from "../../../../models/config/INetwork";
import { CUSTOM } from "../../../../models/config/networkType";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { NetworkService } from "../../../../services/networkService";
import FeedInfo from "../../../components/FeedInfo";
import Feeds from "../../../components/stardust/Feeds";
import NetworkContext from "../../../context/NetworkContext";
import { LandingRouteProps } from "../../LandingRouteProps";
import InfoSection from "../InfoSection";
import FeedFilters from "./FeedFilters";
import { getDefaultLandingState, LandingState } from "./LandingState";
import "./Landing.scss";

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
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            networkConfig, marketCapCurrency, priceCurrency, items, currentItems,
            itemsPerSecond, confirmedItemsPerSecondPercent, latestMilestoneIndex,
            networkAnalytics
        } = this.state;

        const { network } = this.props.match.params;
        const { tokenInfo } = this.context;
        const isShimmer = isShimmerNetwork(network);

        const defaultInfoBox = (
            <div className="main-info-boxes">
                <div className="info-box">
                    <span className="info-box--title">Blocks per sec
                    </span>
                    <div className="info-box--value">
                        <span className="download-rate">
                            {NumberHelper.roundTo(Number(itemsPerSecond), 1) || "--"}
                        </span>
                    </div>
                </div>
                <div className="info-box">
                    <span className="info-box--title">Inclusion rate</span>
                    <span className="info-box--value">
                        {confirmedItemsPerSecondPercent}
                    </span>
                </div>
                {!isShimmer && networkConfig.showMarket && (
                    <div className="info-box">
                        <span className="info-box--title">IOTA Market Cap</span>
                        <span className="info-box--value">{marketCapCurrency}</span>
                    </div>
                )}
                {!isShimmer && networkConfig.showMarket && (
                    <div className="info-box">
                        <span className="info-box--title">Price / MI</span>
                        <span className="info-box--value">
                            {priceCurrency}
                        </span>
                    </div>
                )}
            </div>
        );

        return (
            <div className="landing-stardust">
                <div className={classNames("header-wrapper", { "shimmer": isShimmer })}>
                    <div className="inner">
                        <div className="header">
                            <div className="header--title">
                                <h2>{networkConfig.isEnabled ? "Explore network" : ""}</h2>
                                <div className="network-name"><h1>{networkConfig.label}</h1></div>
                            </div>
                            {defaultInfoBox}
                        </div>
                    </div>
                    <InfoSection analytics={networkAnalytics} tokenInfo={tokenInfo} />
                </div>
                <div className={classNames("wrapper feeds-wrapper", { "shimmer": isShimmer })}>
                    <div className="inner">
                        <div className="feeds-section">
                            <div className="row wrap feeds">
                                <div className="feed section">
                                    <div className="section--header row space-between padding-l-8">
                                        <h2>Latest blocks</h2>
                                        <FeedFilters
                                            networkConfig={networkConfig}
                                            settingsService={this._settingsService}
                                            items={items}
                                            setFilteredItems={filteredItems => {
                                                this.setState({ currentItems: filteredItems });
                                            }}
                                        />
                                    </div>
                                    <FeedInfo
                                        milestoneIndex={latestMilestoneIndex}
                                        frequencyTarget={networkConfig.milestoneInterval}
                                    />
                                    <div className="feed-items">
                                        <div className="row feed-item--header">
                                            <span className="label">Block id</span>
                                            <span className="label">Payload Type</span>
                                        </div>
                                        {currentItems.length === 0 && (
                                            <p>There are no items with the current filter.</p>
                                        )}
                                        {currentItems.map(item => (
                                            <div className="feed-item" key={item.id}>
                                                <div className="feed-item__content">
                                                    <span className="feed-item--label">Block id</span>
                                                    <Link
                                                        className="feed-item--hash"
                                                        to={RouteBuilder.buildItem(networkConfig, item.id)}
                                                    >
                                                        {item.id}
                                                    </Link>
                                                </div>
                                                <div className="feed-item__content">
                                                    <span className="feed-item--label">Payload Type</span>
                                                    <span className="feed-item--value payload-type">
                                                        {item.payloadType}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                    this._currencyData.marketCap !== undefined
                        ? this._currencyService.convertFiatBase(
                            this._currencyData.marketCap,
                            this._currencyData,
                            true,
                            2,
                            undefined,
                            true)
                        : "--",
                priceCurrency: this._currencyData.baseCurrencyRate !== undefined
                    ? this._currencyService.convertFiatBase(
                        this._currencyData.baseCurrencyRate,
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
            this.setState({
                items: this._feedClient.getItems()
            });
        }
    }
}

export default Landing;

