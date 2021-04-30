import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedItemMetadata } from "../../models/api/IFeedItemMetadata";
import { INetwork } from "../../models/db/INetwork";
import { IFeedItem } from "../../models/IFeedItem";
import { ApiClient } from "../../services/apiClient";
import { FeedClient } from "../../services/feedClient";
import { MilestonesClient } from "../../services/milestonesClient";
import { NetworkService } from "../../services/networkService";
import Currency from "./Currency";
import { FeedsState } from "./FeedsState";

/**
 * Component which will be the base for feeds components.
 */
abstract class Feeds<P extends RouteComponentProps<{ network: string }>, S extends FeedsState> extends Currency<P, S> {
    /**
     * Feed client.
     */
    protected _feedClient?: FeedClient;

    /**
     * Api client.
     */
    protected _apiClient?: ApiClient;

    /**
     * Milestones client.
     */
    protected _milestonesClient?: MilestonesClient;

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

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        await this.initNetworkServices();
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     * @param prevState The previous state.
     */
    public async componentDidUpdate(prevProps: P, prevState: S): Promise<void> {
        if (super.componentDidUpdate) {
            super.componentDidUpdate(prevProps, prevState);
        }

        if (this.props.match.params.network !== prevProps.match.params.network) {
            this.closeItems();
            this.closeMilestones();

            await this.initNetworkServices();
        }
    }

    /**
     * The component will unmount from the dom.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();

        this.closeItems();
        this.closeMilestones();
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void {
    }

    /**
     * The items have been updated.
     * @param items The updated items.
     */
    protected itemsUpdated(items: IFeedItem[]): void {
    }

    /**
     * The confirmed items have been updated.
     * @param metaData The updated confirmed items.
     */
    protected metadataUpdated(metaData: { [id: string]: IFeedItemMetadata }): void {
    }

    /**
     * The milestones were updated.
     * @param milestones The list of miletsones.
     */
    protected milestonesUpdated(milestones: {
        /**
         * The id.
         */
        id: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[]): void {
    }

    /**
     * Build the feeds for transactions.
     */
    private async buildItems(): Promise<void> {
        if (this._feedClient) {
            this._itemSubscriptionId = this._feedClient.subscribe(
                async (updatedItems, metadata) => {
                    if (this._isMounted) {
                        await this.updateItems(updatedItems, metadata);
                    }
                }
            );

            await this.updateItems(this._feedClient.getItems(), {});
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
    private async updateItems(newItems: IFeedItem[], metaData: { [id: string]: IFeedItemMetadata }): Promise<void> {
        this.itemsUpdated(newItems);
        this.metadataUpdated(metaData);
    }

    /**
     * Update the transaction tps.
     */
    private async updateTps(): Promise<void> {
        if (this._isMounted && this._apiClient && this._networkConfig) {
            const ips = await this._apiClient.stats({
                network: this._networkConfig.network,
                includeHistory: true
            });

            const itemsPerSecond = ips.itemsPerSecond ?? 0;
            const confirmedItemsPerSecond = ips.confirmedItemsPerSecond ?? 0;
            const confirmedRate = ips.confirmationRate ?? 0;

            this.setState({
                itemsPerSecond: itemsPerSecond >= 0 ? itemsPerSecond.toFixed(2) : "--",
                confirmedItemsPerSecond: confirmedItemsPerSecond >= 0 ? confirmedItemsPerSecond.toFixed(2) : "--",
                confirmedItemsPerSecondPercent: confirmedRate > 0
                    ? `${confirmedRate.toFixed(2)}%` : "--",
                // Increase values by +100 to add more area under the graph
                itemsPerSecondHistory: (ips.itemsPerSecondHistory ?? []).map(v => v + 100)
            });
        }
    }

    /**
     * Build the milestones for the network.
     */
    private async buildMilestones(): Promise<void> {
        if (this._milestonesClient) {
            this._miSubscriptionId = this._milestonesClient.subscribe(
                () => {
                    if (this._isMounted) {
                        this.updateMilestones();
                    }
                }
            );

            this.updateMilestones();
        }
    }

    /**
     * Close the feeds for milestones.
     */
    private closeMilestones(): void {
        if (this._milestonesClient) {
            if (this._miSubscriptionId) {
                this._milestonesClient.unsubscribe(this._miSubscriptionId);
                this._miSubscriptionId = undefined;
            }
            this._milestonesClient = undefined;
        }
    }

    /**
     * Update the milestone feeds.
     */
    private updateMilestones(): void {
        if (this._milestonesClient) {
            const milestones = this._milestonesClient.getMilestones();
            if (this._isMounted) {
                this.setState({
                    milestones
                });
            }
            this.milestonesUpdated(milestones);
        }
    }

    /**
     * Initialise the services for the network.
     */
    private async initNetworkServices(): Promise<void> {
        const networkService = ServiceFactory.get<NetworkService>("network");
        this._networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._apiClient = ServiceFactory.get<ApiClient>("api-client");
        this._milestonesClient = ServiceFactory.get<MilestonesClient>(
            `milestones-${this.props.match.params.network}`);
        this._feedClient = ServiceFactory.get<FeedClient>(
            `feed-${this.props.match.params.network}`);


        await this.updateTps();
        await this.buildItems();
        await this.buildMilestones();

        this._timerId = setInterval(async () => this.updateTps(), 2000);
    }
}

export default Feeds;
