import React, { ReactNode } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { MilestonesClient } from "../../services/milestonesClient";
import { TransactionsClient } from "../../services/transactionsClient";
import AsyncComponent from "./AsyncComponent";
import LineChart from "./LineChart";
import "./SidePanel.scss";
import { SidePanelProps } from "./SidePanelProps";
import { SidePanelState } from "./SidePanelState";

/**
 * Component which will show the side panel component.
 */
class SidePanel extends AsyncComponent<SidePanelProps, SidePanelState> {
    /**
     * Transactions client.
     */
    private _transactionsClient?: TransactionsClient;

    /**
     * Milestones client.
     */
    private _milestonesClient?: MilestonesClient;

    /**
     * The transactions feed subscription.
     */
    private _txSubscriptionId?: string;

    /**
     * The milestones feed subscription.
     */
    private _miSubscriptionId?: string;

    /**
     * Timer id.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Create a new instance of SidePanel.
     * @param props The props.
     */
    constructor(props: SidePanelProps) {
        super(props);

        this.state = {
            transactionsPerSecond: "--",
            transactionsPerSecondHistory: [],
            transactions: [],
            milestones: []
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();

        this.buildTransactions();
        this.buildMilestones();
    }

    /**
     * The component will unmount from the dom.
     */
    public componentWillUnmount(): void {
        this.closeTransactions();
        this.closeMilestones();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="side-panel card">
                <div className="card--header">
                    <h2>Stats</h2>
                </div>
                <div className="card--label card-label--highlight">
                    Transactions Per Second
                </div>
                <div className="card--label card-label--highlight card-label--large">
                    {this.state.transactionsPerSecond}
                </div>
                <LineChart
                    values={this.state.transactionsPerSecondHistory}
                />
            </div>
        );
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
                this._transactionsClient = ServiceFactory.get<TransactionsClient>(`transactions-${this.props.networkConfig.network}`);

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
                transactions,
                transactionsPerSecondHistory: tpsHistory.reverse()
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
                this._milestonesClient = ServiceFactory.get<MilestonesClient>(`milestones-${this.props.networkConfig.network}`);

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

export default SidePanel;
