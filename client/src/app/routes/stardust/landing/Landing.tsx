import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { isShimmerNetwork } from "../../../../helpers/networkHelper";
import { INetwork } from "../../../../models/config/INetwork";
import { CUSTOM } from "../../../../models/config/networkType";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { IFeedItemMetadata } from "../../../../models/feed/IFeedItemMetadata";
import { NetworkService } from "../../../../services/networkService";
import Feeds from "../../../components/stardust/Feeds";
import NetworkContext from "../../../context/NetworkContext";
import { LandingRouteProps } from "../../LandingRouteProps";
import AnalyticStats from "./AnalyticStats";
import BlockFeed from "./BlockFeed";
import InfoBox from "./InfoBox";
import { FeedTabs, getDefaultLandingState, LandingState } from "./LandingState";
import MilestoneFeed from "./MilestoneFeed";
import "./Landing.scss";

const MAX_MILESTONE_ITEMS = 10;

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
            networkConfig, currentTab, marketCapCurrency, priceCurrency, blocks, milestones,
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
                                        <MilestoneFeed
                                            networkConfig={networkConfig}
                                            milestones={milestones}
                                            latestMilestoneIndex={latestMilestoneIndex}
                                        />
                                    )}
                                    {currentTab === FeedTabs.BLOCKS && (
                                        <BlockFeed
                                            networkConfig={networkConfig}
                                            blocks={blocks}
                                            settingsService={this._settingsService}
                                        />
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
            const milestones = this._feedClient.getItems()
                .filter(item => item.payloadType === "MS").slice(0, MAX_MILESTONE_ITEMS);

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

