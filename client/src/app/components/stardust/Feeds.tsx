import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { INetwork } from "../../../models/config/INetwork";
import { STARDUST } from "../../../models/config/protocolVersion";
import { IFeedItem } from "../../../models/feed/IFeedItem";
import { IFeedItemMetadata } from "../../../models/feed/IFeedItemMetadata";
import { NetworkService } from "../../../services/networkService";
import { SettingsService } from "../../../services/settingsService";
import { StardustApiClient } from "../../../services/stardust/stardustApiClient";
import { StardustFeedClient } from "../../../services/stardust/stardustFeedClient";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Currency from "../Currency";
import { FeedsState } from "./FeedsState";

/**
 * Component which will be the base for feeds components.
 */
abstract class Feeds<P extends RouteComponentProps<{ network: string }>, S extends FeedsState> extends Currency<P, S> {
    /**
     * Feed client.
     */
    protected _feedClient?: StardustFeedClient;

    /**
     * Api client.
     */
    protected _apiClient?: StardustApiClient;

    /**
     * The cache serice.
     */
    protected _tangleCacheService?: StardustTangleCacheService;

    /**
     * Settings service.
     */
    protected _settingsService: SettingsService;

    /**
     * The items feed subscription.
     */
    protected _itemSubscriptionId?: string;

    /**
     * Update tps timer id.
     */
    protected _updateTpstimerId?: NodeJS.Timer;

    /**
     * Feed liveness probe timer id.
     */
    protected _feedProbeTimerId?: NodeJS.Timer;

    /**
     * Constant in minutes to perform the chronicle analytics refresh.
     */
    protected readonly CHRONICLE_ANALYTICS_REFRESH_MINUTES = 5;

    /**
     * Shimmer token claiming stats timer id.
     */
    protected _chronicleAnalyticsTimerHandle?: NodeJS.Timer;

    /**
     * The last update items call in epoch time.
     */
    protected _lastUpdateItems?: number;

    /**
     * The network configuration;
     */
    protected _networkConfig: INetwork | undefined;

    /**
     * The feed probe threshold in ms.
     */
    private readonly FEER_PROBE_THRESHOLD: number = 1500;

    constructor(props: P) {
        super(props);

        this._settingsService = ServiceFactory.get<SettingsService>("settings");
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        this.initNetworkServices();
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     * @param prevState The previous state.
     */
    public componentDidUpdate(prevProps: P, prevState: S): void {
        if (super.componentDidUpdate) {
            super.componentDidUpdate(prevProps, prevState);
        }

        if (this.props.match.params.network !== prevProps.match.params.network) {
            this.closeItems();
            this.setState({ latestMilestoneIndex: undefined });

            this.initNetworkServices();
        }
    }

    /**
     * The component will unmount from the dom.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();

        this.closeItems();
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void { }

    /**
     * The items have been updated.
     * @param newItems The updated items.
     */
    protected itemsUpdated(newItems: IFeedItem[]): void {
        if (newItems) {
            const milestones = newItems.filter(i => i.payloadType === "MS");
            let newIndex;

            for (const ms of milestones) {
                const index: number | undefined = ms.properties?.index as number;
                const currentIndex = this.state.latestMilestoneIndex;
                if (index && currentIndex !== undefined && index > currentIndex) {
                    newIndex = index;
                }
            }

            if (newIndex) {
                this.setState({ latestMilestoneIndex: newIndex });
            }
        }
    }

    /**
     * The confirmed items have been updated.
     * @param metaData The updated confirmed items.
     */
    protected metadataUpdated(metaData: { [id: string]: IFeedItemMetadata }): void { }

    /**
     * Build the feeds for transactions.
     */
    private buildItems(): void {
        if (this._feedClient) {
            this._itemSubscriptionId = this._feedClient.subscribe(
                (updatedItems, metadata) => {
                    if (this._isMounted) {
                        this.updateItems(updatedItems, metadata);
                    }
                }
            );

            this.updateItems(this._feedClient.getItems(), {});
        }
    }

    /**
     * Close the feeds for transactions.
     */
    private closeItems(): void {
        if (this._feedClient) {
            if (this._itemSubscriptionId) {
                this._feedClient.unsubscribe(this._itemSubscriptionId);
                this._itemSubscriptionId = undefined;
            }
            this._feedClient = undefined;
        }

        if (this._updateTpstimerId) {
            clearInterval(this._updateTpstimerId);
            this._updateTpstimerId = undefined;
        }

        this.stopChronicleAnalyticsJob();

        this._lastUpdateItems = undefined;
        if (this._feedProbeTimerId) {
            clearInterval(this._feedProbeTimerId);
            this._feedProbeTimerId = undefined;
        }
    }

    /**
     * Update the items feeds.
     * @param newItems Just the new items.
     * @param metaData New confirmed items.
     */
    private updateItems(newItems: IFeedItem[], metaData: { [id: string]: IFeedItemMetadata }): void {
        this._lastUpdateItems = Date.now();

        this.itemsUpdated(newItems);
        this.metadataUpdated(metaData);
    }

    /**
     * Update the transaction tps.
     */
    private updateTps(): void {
        if (this._isMounted && this._apiClient && this._networkConfig) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._apiClient.stats({
                network: this._networkConfig.network,
                includeHistory: true
            }).then(ips => {
                const itemsPerSecond = ips.itemsPerSecond ?? 0;
                const confirmedItemsPerSecond = ips.confirmedItemsPerSecond ?? 0;
                const confirmedRate = ips.confirmationRate
                    ? (ips.confirmationRate > 100 ? 100 : ips.confirmationRate) : 0;

                this.setState({
                    itemsPerSecond: itemsPerSecond >= 0 ? itemsPerSecond.toFixed(2) : "--",
                    confirmedItemsPerSecond: confirmedItemsPerSecond >= 0 ? confirmedItemsPerSecond.toFixed(2) : "--",
                    confirmedItemsPerSecondPercent: confirmedRate > 0
                        ? `${confirmedRate.toFixed(2)}%` : "--",
                    latestMilestoneIndex: this.state.latestMilestoneIndex ?? ips.latestMilestoneIndex,
                    // Increase values by +100 to add more area under the graph
                    itemsPerSecondHistory: (ips.itemsPerSecondHistory ?? []).map(v => v + 100)
                });
            })
                .catch(err => {
                    console.error(err);
                })
                .finally(() => {
                    this._updateTpstimerId = setTimeout(async () => this.updateTps(), 4000);
                });
        }
    }

    /**
     * Fetch the chronicle analytics.
     */
    private async fetchAnalytics(): Promise<void> {
        if (this._networkConfig?.network) {
            const response = await this._tangleCacheService?.chronicleAnalytics(this._networkConfig?.network);

            if (!response?.error) {
                this.setState({
                    networkAnalytics: {
                        nativeTokens: response?.analyticStats?.nativeTokens,
                        nfts: response?.analyticStats?.nfts,
                        totalAddresses: response?.analyticStats?.totalAddresses,
                        dailyAddresses: response?.analyticStats?.dailyAddresses,
                        lockedStorageDeposit: response?.analyticStats?.lockedStorageDeposit,
                        unclaimedShimmer: response?.analyticStats?.unclaimedShimmer
                    }
                });
            } else {
                console.log("Analytics stats refresh failed.");
            }
        }
    }

    /**
     * Initialise the services for the network.
     */
    private initNetworkServices(): void {
        const networkService = ServiceFactory.get<NetworkService>("network");
        this._networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(
            `tangle-cache-${STARDUST}`
        );
        this._feedClient = ServiceFactory.get<StardustFeedClient>(
            `feed-${this.props.match.params.network}`);

        this.updateTps();
        this.buildItems();

        this.setupChronicleAnalyticsRefresh();
        this.setupFeedLivenessProbe();
    }

    /**
     * Set up the shimmer claimed count stat refresh.
     */
    private setupChronicleAnalyticsRefresh(): void {
        this.stopChronicleAnalyticsJob();
        // eslint-disable-next-line no-void
        void this.fetchAnalytics();
        this._chronicleAnalyticsTimerHandle = setInterval(() => {
            // eslint-disable-next-line no-void
            void this.fetchAnalytics();
        }, this.CHRONICLE_ANALYTICS_REFRESH_MINUTES * 60 * 1000);
    }

    private stopChronicleAnalyticsJob(): void {
        if (this._chronicleAnalyticsTimerHandle) {
            clearInterval(this._chronicleAnalyticsTimerHandle);
            this._chronicleAnalyticsTimerHandle = undefined;
        }
    }

    /**
     * Sets up a check at interval to catch the case when feed stops streaming.
     */
    private setupFeedLivenessProbe(): void {
        this._feedProbeTimerId = setInterval(() => {
            if (!this._lastUpdateItems) {
                this._lastUpdateItems = Date.now();
            }

            const msSinceLast = Date.now() - this._lastUpdateItems;

            if (this._lastUpdateItems && msSinceLast > this.FEER_PROBE_THRESHOLD) {
                this.closeItems();

                this.initNetworkServices();
            }
        }, this.FEER_PROBE_THRESHOLD);
    }
}

export default Feeds;
