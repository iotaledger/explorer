import classNames from "classnames";
import moment from "moment";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { DateHelper } from "../../../../helpers/dateHelper";
import { isShimmerNetwork } from "../../../../helpers/networkHelper";
import { RouteBuilder } from "../../../../helpers/routeBuilder";
import { INetwork } from "../../../../models/config/INetwork";
import { CUSTOM } from "../../../../models/config/networkType";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { IFeedItemMetadata } from "../../../../models/feed/IFeedItemMetadata";
import { NetworkService } from "../../../../services/networkService";
import FeedMilestoneInfo from "../../../components/FeedMilestoneInfo";
import Feeds from "../../../components/stardust/Feeds";
import Tooltip from "../../../components/Tooltip";
import NetworkContext from "../../../context/NetworkContext";
import { LandingRouteProps } from "../../LandingRouteProps";
import AnalyticStats from "./AnalyticStats";
import FeedFilters from "./FeedFilters";
import InfoBox from "./InfoBox";
import { FeedTabs, getDefaultLandingState, LandingState } from "./LandingState";
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
            networkConfig, currentTab, marketCapCurrency, priceCurrency, blocks, filteredBlocks, milestones,
            itemsPerSecond, confirmedItemsPerSecondPercent, latestMilestoneIndex, networkAnalytics
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
                    <AnalyticStats analytics={networkAnalytics} tokenInfo={tokenInfo} />
                </div>
                <div className={classNames("wrapper feeds-wrapper", { "shimmer": isShimmer })}>
                    <div className="inner">
                        <div className="feeds-section">
                            <div className="row wrap feeds">
                                <div className="feed section">
                                    <div className="tabs-wrapper">
                                        {Object.entries(FeedTabs).map(([_, label]) => (
                                            <button
                                                key={label}
                                                type="button"
                                                className={classNames("tab", { active: currentTab === label })}
                                                onClick={() => this.setState({ currentTab: label })}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    {currentTab === FeedTabs.MILESTONES && (
                                        <>
                                            <div className="section--header row space-between padding-l-8">
                                                <h2>Latest milestones</h2>
                                            </div>
                                            <div className="feed-items">
                                                <div className="row feed-item--header ms-feed">
                                                    <span className="label ms-index">Index</span>
                                                    <span className="label ms-id">Milestone Id</span>
                                                    <span className="label ms-blocks">Blocks</span>
                                                    <span className="label ms-txs">Txs</span>
                                                    <span className="label ms-timestamp">Timestamp</span>
                                                </div>
                                                {milestones.map(ms => {
                                                    const index = ms.properties?.index as number;
                                                    const milestoneId = ms.properties?.milestoneId as string;
                                                    const milestoneIdShort =
                                                        `${milestoneId.slice(0, 6)}....${milestoneId.slice(-6)}`;
                                                    const timestamp = ms.properties?.timestamp as number * 1000;
                                                    const includedBlocks = 5;
                                                    const txs = 2;
                                                    const ago = moment(timestamp).fromNow();
                                                    const tooltipContent = DateHelper.formatShort(timestamp);

                                                    return (
                                                        <div className="feed-item ms-feed" key={ms.id}>
                                                            <div className="feed-item__content">
                                                                <span className="feed-item--label">Index</span>
                                                                <span className="feed-item--value ms-index">
                                                                    <Link
                                                                        className="feed-item--hash ms-id"
                                                                        to={`${network}/search/${index}`}
                                                                    >
                                                                        {index}
                                                                    </Link>
                                                                </span>
                                                            </div>
                                                            <div className="feed-item__content">
                                                                <span className="feed-item--label">Milestone id</span>
                                                                <Link
                                                                    className="feed-item--hash ms-id"
                                                                    to={RouteBuilder.buildItem(
                                                                        networkConfig, milestoneId
                                                                    )}
                                                                >
                                                                    {milestoneIdShort}
                                                                </Link>
                                                            </div>
                                                            <div className="feed-item__content">
                                                                <span className="feed-item--label">Blocks</span>
                                                                <span className="feed-item--value ms-blocks">
                                                                    {includedBlocks}
                                                                </span>
                                                            </div>
                                                            <div className="feed-item__content">
                                                                <span className="feed-item--label">Txs</span>
                                                                <span className="feed-item--value ms-txs">
                                                                    {txs}
                                                                </span>
                                                            </div>
                                                            <div className="feed-item__content">
                                                                <span className="feed-item--label">Timestamp</span>
                                                                <span className="feed-item--value ms-timestamp">
                                                                    <Tooltip
                                                                        tooltipContent={tooltipContent}
                                                                    >
                                                                        {ago}
                                                                    </Tooltip>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                    {currentTab === FeedTabs.BLOCKS && (
                                        <>
                                            <div className="section--header row space-between padding-l-8">
                                                <h2>Latest blocks</h2>
                                                <FeedFilters
                                                    networkConfig={networkConfig}
                                                    settingsService={this._settingsService}
                                                    items={blocks}
                                                    setFilteredItems={filteredItems => {
                                                        this.setState({ filteredBlocks: filteredItems });
                                                    }}
                                                />
                                            </div>
                                            <FeedMilestoneInfo
                                                milestoneIndex={latestMilestoneIndex}
                                                frequencyTarget={networkConfig.milestoneInterval}
                                            />
                                            <div className="feed-items">
                                                <div className="row feed-item--header">
                                                    <span className="label">Block id</span>
                                                    <span className="label">Payload Type</span>
                                                </div>
                                                {filteredBlocks.length === 0 && (
                                                    <p>There are no items with the current filter.</p>
                                                )}
                                                {filteredBlocks.map(item => (
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
                                        </>
                                    )}
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
            const blocks = this._feedClient.getItems();
            const milestones = this._feedClient.getItems().filter(item => item.payloadType === "MS").slice(0, 15);

            this.setState({
                blocks,
                milestones
            });
        }
    }

    /**
     * The confirmed items have been updated.
     * @param metaData The updated confirmed items.
     */
    protected metadataUpdated(metaData: { [id: string]: IFeedItemMetadata }): void {
        super.metadataUpdated(metaData);
    }
}

export default Landing;

