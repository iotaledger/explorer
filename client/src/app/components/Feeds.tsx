import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../factories/serviceFactory";
import { INetwork } from "../../models/db/INetwork";
import { IFeedItem } from "../../models/IFeedItem";
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
    public componentDidMount(): void {
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
            this.closeMilestones();

            this.initNetworkServices();
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
     * @param confirmed The updated confirmed items.
     */
    protected confirmedUpdated(confirmed: string[]): void {
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
    private buildItems(): void {
        this.setState(
            {
                itemsPerSecond: "--"
            },
            () => {
                this._feedClient = ServiceFactory.get<FeedClient>(
                    `feed-${this.props.match.params.network}`);

                if (this._feedClient) {
                    this._itemSubscriptionId = this._feedClient.subscribe(
                        (updatedItems, updatedConfirmed) => {
                            if (this._isMounted) {
                                this.updateItems(updatedItems, updatedConfirmed);
                                this.updateTps();
                            }
                        }
                    );

                    this.updateItems(this._feedClient.getItems(), this._feedClient.getConfirmedIds());
                    this.updateTps();
                    this._timerId = setInterval(() => this.updateTps(), 2000);
                }
            });
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
     * @param newConfirmed New confirmed items.
     */
    private updateItems(newItems: IFeedItem[], newConfirmed: string[]): void {
        if (this._isMounted && this._feedClient) {
            const ipsHistory = this._feedClient.getIpsHistory();

            this.setState({
                // Increase values by +100 to add more area under the graph
                itemsPerSecondHistory: ipsHistory.reverse().map(v => v + 100)
            }, () => {
                this.itemsUpdated(newItems);
                this.confirmedUpdated(newConfirmed);
            });
        }
    }

    /**
     * Update the transaction tps.
     */
    private updateTps(): void {
        if (this._isMounted && this._feedClient) {
            const ips = this._feedClient.getIitemPerSecond();

            this.setState({
                itemsPerSecond: ips.itemsPerSecond >= 0 ? ips.itemsPerSecond.toFixed(2) : "--",
                confirmedItemsPerSecond: ips.confirmedPerSecond >= 0 ? ips.confirmedPerSecond.toFixed(2) : "--",
                confirmedItemsPerSecondPercent: ips.itemsPerSecond > 0
                    ? `${(ips.confirmedPerSecond / ips.itemsPerSecond * 100).toFixed(2)}%` : "--"
            });
        }
    }

    /**
     * Build the milestones for the network.
     */
    private buildMilestones(): void {
        this.setState(
            {
                milestones: []
            },
            () => {
                this._milestonesClient = ServiceFactory.get<MilestonesClient>(
                    `milestones-${this.props.match.params.network}`);

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
            });
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
    private initNetworkServices(): void {
        const networkService = ServiceFactory.get<NetworkService>("network");
        this._networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this.buildItems();
        this.buildMilestones();
    }
}

export default Feeds;
