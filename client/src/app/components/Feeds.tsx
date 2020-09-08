import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../factories/serviceFactory";
import { FeedClient } from "../../services/feedClient";
import { MilestonesClient } from "../../services/milestonesClient";
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
     * The transactions feed subscription.
     */
    protected _txSubscriptionId?: string;

    /**
     * The milestones feed subscription.
     */
    protected _miSubscriptionId?: string;

    /**
     * Timer id.
     */
    protected _timerId?: NodeJS.Timer;

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();

        this.buildTransactions();
        this.buildMilestones();
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
            this.closeTransactions();
            this.buildTransactions();

            this.closeMilestones();
            this.buildMilestones();
        }
    }

    /**
     * The component will unmount from the dom.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();

        this.closeTransactions();
        this.closeMilestones();
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void {
    }

    /**
     * The transactions have been updated.
     * @param transactions The updated transactions.
     */
    protected transactionsUpdated(transactions: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The trunk.
         */
        trunk: string;
        /**
         * The branch.
         */
        branch: string;
        /**
         * The transaction value.
         */
        value: number;
    }[]): void {
    }

    /**
     * The confirmed transactions have been updated.
     * @param confirmed The updated confirmed transactions.
     */
    protected confirmedUpdated(confirmed: string[]): void {
    }

    /**
     * Build the feeds for transactions.
     */
    private buildTransactions(): void {
        this.setState(
            {
                transactions: [],
                transactionsPerSecond: "--"
            },
            () => {
                this._feedClient = ServiceFactory.get<FeedClient>(
                    `feed-${this.props.match.params.network}`);

                if (this._feedClient) {
                    this._txSubscriptionId = this._feedClient.subscribe(
                        () => {
                            if (this._isMounted) {
                                this.updateTransactions();
                                this.updateTps();
                            }
                        }
                    );

                    this.updateTransactions();
                    this.updateTps();
                    this._timerId = setInterval(() => this.updateTps(), 2000);
                }
            });
    }

    /**
     * Close the feeds for transactions.
     */
    private closeTransactions(): void {
        if (this._feedClient) {
            if (this._txSubscriptionId) {
                this._feedClient.unsubscribe(this._txSubscriptionId);
                this._txSubscriptionId = undefined;
            }
            this._feedClient = undefined;
        }

        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Update the transaction feeds.
     */
    private updateTransactions(): void {
        if (this._isMounted && this._feedClient) {
            const transactions = this._feedClient.getTransactions();
            const confirmed = this._feedClient.getConfirmedTransactions();
            const tpsHistory = this._feedClient.getTxTpsHistory();

            this.setState({
                transactions,
                confirmed,
                // Increase values by +100 to add more area under the graph
                transactionsPerSecondHistory: tpsHistory.reverse().map(v => v + 100)
            }, () => {
                this.transactionsUpdated(transactions);
                this.confirmedUpdated(confirmed);
            });
        }
    }

    /**
     * Update the transaction tps.
     */
    private updateTps(): void {
        if (this._isMounted && this._feedClient) {
            const tps = this._feedClient.getTps();

            this.setState({
                transactionsPerSecond: tps.tx >= 0 ? tps.tx.toFixed(2) : "--",
                confirmedTransactionsPerSecond: tps.sn >= 0 ? tps.sn.toFixed(2) : "--",
                confirmedTransactionsPerSecondPercent: tps.tx > 0
                    ? `${(tps.sn / tps.tx * 100).toFixed(2)}%` : "--"
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
        if (this._isMounted && this._milestonesClient) {
            this.setState({
                milestones: this._milestonesClient.getMilestones()
            });
        }
    }
}

export default Feeds;
