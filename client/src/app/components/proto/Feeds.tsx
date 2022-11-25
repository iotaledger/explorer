import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { INetwork } from "../../../models/config/INetwork";
import { PROTO } from "../../../models/config/protocolVersion";
import { IFeedItem } from "../../../models/feed/IFeedItem";
import { IFeedItemMetadata } from "../../../models/feed/IFeedItemMetadata";
import { NetworkService } from "../../../services/networkService";
import { ProtoApiClient } from "../../../services/proto/protoApiClient";
import { ProtoFeedClient } from "../../../services/proto/protoFeedClient";
import { SettingsService } from "../../../services/settingsService";
import AsyncComponent from "../AsyncComponent";
import { FeedsState } from "./FeedsState";

/**
 * Component which will be the base for feeds components.
 */
abstract class Feeds<P extends RouteComponentProps<{ network: string }>, S extends FeedsState>
    extends AsyncComponent<P, S> {
    /**
     * Feed client.
     */
    protected _feedClient?: ProtoFeedClient;

    /**
     * Api client.
     */
    protected _apiClient?: ProtoApiClient;

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
            this.setState({ shimmerClaimed: undefined });

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
    protected updateCurrency(): void {
    }

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
    protected metadataUpdated(metaData: { [id: string]: IFeedItemMetadata }): void {
    }

    /**
     * Build the feeds for transactions.
     */
    private buildItems(): void {
        if (this._feedClient) {
            // eslint-disable-next-line no-warning-comments
            // TODO: subscribe and get items
        }
    }

    /**
     * Close the feeds for transactions.
     */
    private closeItems(): void {
        if (this._feedClient) {
            // eslint-disable-next-line no-warning-comments
            // TODO: unsubscribe from feed and reset feed client
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
            // TOOD: query current TPS
        }
    }

    /**
     * Fetch the chronicle analytics.
     */
    private async fetchAnalytics(): Promise<void> {
        if (this._networkConfig?.network) {
            // eslint-disable-next-line no-warning-comments
            // TODO: query analytics via API client

            /*
            const analytics = await this._apiClient?.analytics({ network: this._networkConfig?.network });
            const hasAnaytics = Object.getOwnPropertyNames(analytics).length > 0;

            if (hasAnaytics) {
                this.setState({ networkAnalytics: analytics });
            }
             */
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

        this._apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);
        this._feedClient = ServiceFactory.get<ProtoFeedClient>(
            `feed-${this.props.match.params.network}`);


        this.updateTps();
        this.buildItems();
        // eslint-disable-next-line no-void
        void this.fetchAnalytics();

        this.setupFeedLivenessProbe();
    }

    /**
     * Sets up a check at interval to catch the case when feed stops streaming.
     */
    private setupFeedLivenessProbe(): void {
        if (this._feedProbeTimerId) {
            clearInterval(this._feedProbeTimerId);
        }
        this._feedProbeTimerId = setInterval(() => {
            if (!this._lastUpdateItems) {
                this._lastUpdateItems = Date.now();
            }

            const deltaSinceLast = Date.now() - this._lastUpdateItems;

            if (this._lastUpdateItems && deltaSinceLast > this.FEER_PROBE_THRESHOLD) {
                console.log("closing items and initiating network services");
                this.closeItems();

                this.initNetworkServices();
            }
        }, this.FEER_PROBE_THRESHOLD);
    }
}

export default Feeds;
