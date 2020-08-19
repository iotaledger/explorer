import React, { ReactNode } from "react";
import { ForceGraph3D } from "react-force-graph";
import { RouteComponentProps } from "react-router-dom";
import { SizeMe } from "react-sizeme";
import Feeds from "../components/Feeds";
import "./Visualizer.scss";
import { VisualizerRouteProps } from "./VisualizerRouteProps";
import { VisualizerState } from "./VisualizerState";


/**
 * Component which will show the visualizer page.
 */
class Visualizer extends Feeds<RouteComponentProps<VisualizerRouteProps>, VisualizerState> {
    /**
     * All the transactions to vizualise.
     */
    private readonly _allTransactions: {
        [hash: string]: {
            /**
             * The tx hash.
             */
            hash: string;
            /**
             * The trunk.
             */
            trunk?: string;
            /**
             * The branch.
             */
            branch?: string;
            /**
             * The transaction value.
             */
            value?: number;
        };
    };

    /**
     * Create a new instance of Visualizer.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<VisualizerRouteProps>) {
        super(props);

        this._allTransactions = {};

        this.state = {
            graphData: {
                nodes: [],
                links: []
            },
            transactionsPerSecond: "--",
            transactionsPerSecondHistory: [],
            transactions: [],
            milestones: [],
            currency: "USD",
            currencies: []
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        window.scrollTo({
            left: 0,
            top: 0,
            behavior: "smooth"
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="visualizer">
                <div className="row middle space-between">
                    <h1>Visualizer</h1>
                    <div className="row middle">
                        <span className="visualizer-value margin-r-t">{this.state.transactionsPerSecond}</span>
                        <span className="visualizer-label">TPS</span>
                    </div>
                </div>
                <div className="graph-border margin-t-t">
                    <SizeMe>
                        {params =>
                            (
                                <ForceGraph3D
                                    backgroundColor="#ffffff"
                                    graphData={this.state.graphData}
                                    width={params.size.width ?? 1}
                                    height={document.body.clientHeight * 0.8}
                                    nodeAutoColorBy="timestamp"
                                    linkOpacity={0.5}
                                    linkWidth={1}
                                    linkColor="#000000"
                                    nodeVal={20}
                                />
                            )}
                    </SizeMe>
                </div>
            </div>
        );
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
        const newTxs = [];
        for (const tx of transactions) {
            if (!this._allTransactions[tx.hash]) {
                this._allTransactions[tx.hash] = tx;
                newTxs.push(tx);
            }
        }

        const graphData = this.state.graphData;
        const newNodes: {
            id: string;
            timestamp: number;
        }[] = [];
        const newLinks: {
            source: string;
            target: string;
        }[] = [];

        const now = Math.floor(Date.now() / 10000);

        for (const tx of newTxs) {
            newNodes.push({ id: tx.hash, timestamp: now });

            if (!this._allTransactions[tx.branch]) {
                newNodes.push({ id: tx.branch, timestamp: now });
                this._allTransactions[tx.branch] = {
                    hash: tx.branch
                };
            }
            newLinks.push({ source: tx.hash, target: tx.branch });

            if (!this._allTransactions[tx.trunk]) {
                newNodes.push({ id: tx.trunk, timestamp: now });
                this._allTransactions[tx.trunk] = {
                    hash: tx.trunk
                };
            }
            newLinks.push({ source: tx.hash, target: tx.trunk });
        }

        this.setState({
            graphData: {
                nodes: graphData.nodes.concat(newNodes),
                links: graphData.links.concat(newLinks)
            }
        });
    }
}

export default Visualizer;
