import { ServiceFactory } from "../../factories/serviceFactory";
import { MilestonesClient } from "../../services/milestonesClient";
import { TransactionsClient } from "../../services/transactionsClient";
import { NetworkProps } from "../NetworkProps";
import Currency from "./Currency";
import { FeedsState } from "./FeedsState";

/**
 * Component which will be the base for feeds components.
 */
abstract class Feeds<P extends NetworkProps, S extends FeedsState> extends Currency<P, S> {
    /**
     * Transactions client.
     */
    protected _transactionsClient?: TransactionsClient;

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

        if (this.props.networkConfig !== prevProps.networkConfig) {
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
     * Filter the transactions and return them.
     * @param transactions The transactions to filter.
     * @returns The filtered transactions.
     */
    protected filterTransactions(transactions: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        value: number;
    }[]): {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        value: number;
    }[] {
        return transactions;
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
                this._transactionsClient = ServiceFactory.get<TransactionsClient>(
                    `transactions-${this.props.networkConfig.network}`);

                this._txSubscriptionId = this._transactionsClient.subscribe(
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
            });
    }

    /**
     * Close the feeds for transactions.
     */
    private closeTransactions(): void {
        if (this._transactionsClient) {
            if (this._txSubscriptionId) {
                this._transactionsClient.unsubscribe(this._txSubscriptionId);
                this._txSubscriptionId = undefined;
            }
            this._transactionsClient = undefined;
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
        if (this._isMounted && this._transactionsClient) {
            const transactions = this._transactionsClient.getTransactions();
            const tpsHistory = this._transactionsClient.getTpsHistory();

            this.setState({
                transactions: this.filterTransactions(transactions),
                // Increase values by +100 to add more area under the graph
                transactionsPerSecondHistory: tpsHistory.reverse().map(v => v + 100)
            });
        }
    }

    /**
     * Update the transaction tps.
     */
    private updateTps(): void {
        if (this._isMounted && this._transactionsClient) {

            const tps = this._transactionsClient.getTps();

            this.setState({
                transactionsPerSecond: tps >= 0 ? tps.toFixed(2) : "--"
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
                    `milestones-${this.props.networkConfig.network}`);

                this._miSubscriptionId = this._milestonesClient.subscribe(
                    () => {
                        if (this._isMounted) {
                            this.updateMilestones();
                        }
                    }
                );

                this.updateMilestones();
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
