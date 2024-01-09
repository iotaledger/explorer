import { RouteComponentProps } from "react-router-dom";
import { FeedsState } from "./FeedsState";
import { ServiceFactory } from "~factories/serviceFactory";
import { INetwork } from "~models/config/INetwork";
import { CUSTOM, LEGACY_MAINNET } from "~models/config/networkType";
import { CHRYSALIS } from "~models/config/protocolVersion";
import { IFeedItem } from "~models/feed/IFeedItem";
import { IFeedItemMetadata } from "~models/feed/IFeedItemMetadata";
import { ChrysalisApiClient } from "~services/chrysalis/chrysalisApiClient";
import { ChrysalisFeedClient } from "~services/chrysalis/chrysalisFeedClient";
import { NetworkService } from "~services/networkService";
import { SettingsService } from "~services/settingsService";
import Currency from "../Currency";

/**
 * Component which will be the base for feeds components.
 */
abstract class Feeds<P extends RouteComponentProps<{ network: string }>, S extends FeedsState> extends Currency<P, S> {
    /**
     * Feed client.
     */
    protected _feedClient?: ChrysalisFeedClient;

    /**
     * Api client.
     */
    protected _apiClient?: ChrysalisApiClient;

    /**
     * Settings service.
     */
    protected _settingsService: SettingsService;

    /**
     * The items feed subscription.
     */
    protected _itemSubscriptionId?: string;

    /**
     * The milestones feed subscription.
     */
    protected _miSubscriptionId?: string;

    /**
     * Timer id.
     */
    protected _timerId?: NodeJS.Timer;

    /**
     * The network configuration;
     */
    protected _networkConfig: INetwork | undefined;

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
    protected updateCurrency(): void {}

    /**
     * The items have been updated.
     * @param newItems The updated items.
     */
    protected itemsUpdated(newItems: IFeedItem[]): void {
        const isLatestMilestoneFeedInfoEnabled =
            this._networkConfig && this._networkConfig.network !== LEGACY_MAINNET && this._networkConfig.network !== CUSTOM;

        if (isLatestMilestoneFeedInfoEnabled && newItems) {
            const milestones = newItems.filter((i) => i.payloadType === "MS");
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
    protected metadataUpdated(metaData: { [id: string]: IFeedItemMetadata }): void {}

    /**
     * Build the feeds for transactions.
     */
    private buildItems(): void {
        if (this._feedClient) {
            this._itemSubscriptionId = this._feedClient.subscribe((updatedItems, metadata) => {
                if (this._isMounted) {
                    this.updateItems(updatedItems, metadata);
                }
            });

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

        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Update the items feeds.
     * @param newItems Just the new items.
     * @param metaData New confirmed items.
     */
    private updateItems(newItems: IFeedItem[], metaData: { [id: string]: IFeedItemMetadata }): void {
        this.itemsUpdated(newItems);
        this.metadataUpdated(metaData);
    }

    /**
     * Update the transaction tps.
     */
    private updateTps(): void {
        if (this._isMounted && this._apiClient && this._networkConfig) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._apiClient
                .stats({
                    network: this._networkConfig.network,
                    includeHistory: true,
                })
                .then((ips) => {
                    const itemsPerSecond = ips.itemsPerSecond ?? 0;
                    const confirmedItemsPerSecond = ips.confirmedItemsPerSecond ?? 0;
                    const confirmedRate = ips.confirmationRate ? (ips.confirmationRate > 100 ? 100 : ips.confirmationRate) : 0;

                    this.setState({
                        itemsPerSecond: itemsPerSecond >= 0 ? itemsPerSecond.toFixed(2) : "--",
                        confirmedItemsPerSecond: confirmedItemsPerSecond >= 0 ? confirmedItemsPerSecond.toFixed(2) : "--",
                        confirmedItemsPerSecondPercent: confirmedRate > 0 ? `${confirmedRate.toFixed(2)}%` : "--",
                        latestMilestoneIndex: this.state.latestMilestoneIndex ?? ips.latestMilestoneIndex,
                        // Increase values by +100 to add more area under the graph
                        itemsPerSecondHistory: (ips.itemsPerSecondHistory ?? []).map((v) => v + 100),
                    });
                })
                .catch((err) => {
                    console.error(err);
                })
                .finally(() => {
                    this._timerId = setTimeout(async () => this.updateTps(), 4000);
                });
        }
    }

    /**
     * Initialise the services for the network.
     */
    private initNetworkServices(): void {
        const networkService = ServiceFactory.get<NetworkService>("network");
        this._networkConfig = this.props.match.params.network ? networkService.get(this.props.match.params.network) : undefined;

        this._apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);
        this._feedClient = ServiceFactory.get<ChrysalisFeedClient>(`feed-${this.props.match.params.network}`);

        this.updateTps();
        this.buildItems();

        this._timerId = setTimeout(async () => this.updateTps(), 4000);
    }
}

export default Feeds;
