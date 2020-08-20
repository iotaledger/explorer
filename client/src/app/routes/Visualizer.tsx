import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import Viva from "vivagraphjs";
import { buildCircleNodeShader } from "../../helpers/circleNodeShader";
import Feeds from "../components/Feeds";
import "./Visualizer.scss";
import { VisualizerRouteProps } from "./VisualizerRouteProps";
import { VisualizerState } from "./VisualizerState";

/**
 * Component which will show the visualizer page.
 */
class Visualizer extends Feeds<RouteComponentProps<VisualizerRouteProps>, VisualizerState> {
    /**
     * Maximum number of transactions.
     */
    private static readonly MAX_TRANSACTIONS: number = 5000;

    /**
     * Vertex colour R,G,B.
     */
    private static readonly EDGE_COLOR_DEFAULT: number = 0xEE;

    /**
     * Vertex size.
     */
    private static readonly VERTEX_SIZE: number = 20;

    /**
     * Vertex colour R.
     */
    private static readonly VERTEX_COLOR_DEFAULT_R: number = 0x0F;

    /**
     * Vertex colour G.
     */
    private static readonly VERTEX_COLOR_DEFAULT_G: number = 0xC1;

    /**
     * Vertex Colour B.
     */
    private static readonly VERTEX_COLOR_DEFAULT_B: number = 0xB7;

    /**
     * The graph instance.
     */
    private _graph?: Viva.Graph.IGraph;

    /**
     * The renderer instance.
     */
    private _renderer?: Viva.Graph.View.IRenderer;

    /**
     * The graphics instance.
     */
    private _graphics?: Viva.Graph.View.IWebGLGraphics;

    /**
     * All the transactions to vizualise.
     */
    private readonly _transactionHashes: string[];

    /**
     * New transactions to process.
     */
    private _newTransactions: {
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
    }[];

    /**
     * Timer for display updates.
     */
    private _drawTimer?: number;

    /**
     * Create a new instance of Visualizer.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<VisualizerRouteProps>) {
        super(props);

        this._transactionHashes = [];
        this._newTransactions = [];

        this.state = {
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

        window.addEventListener("resize", () => {
            if (this._graphics) {
                this._graphics.updateSize();
            }
        });

        window.scrollTo({
            left: 0,
            top: 0,
            behavior: "smooth"
        });
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._drawTimer) {
            cancelAnimationFrame(this._drawTimer);
            this._drawTimer = undefined;
        }
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
                    <div
                        className="viva"
                        ref={r => this.setupGraph(r)}
                    />
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
        this._newTransactions = this._newTransactions.concat(transactions);
    }

    /**
     * Setup the graph.
     * @param graphElem The element to use.
     */
    private setupGraph(graphElem: HTMLElement | null): void {
        if (graphElem && !this._graph) {
            this._graph = Viva.Graph.graph();

            this._graphics = Viva.Graph.View.webglGraphics();

            const layout = Viva.Graph.Layout.forceDirected(this._graph, {
                springLength: 10,
                springCoeff: 0.0001,
                stableThreshold: 0.15,
                gravity: -2,
                dragCoeff: 0.02,
                timeStep: 20,
                theta: 0.8
            });

            this._graphics.setNodeProgram(buildCircleNodeShader());

            this._graphics.node(() => ({
                size: Visualizer.VERTEX_SIZE,
                color: `0x${Visualizer.VERTEX_COLOR_DEFAULT_R.toString(16)
                    }${Visualizer.VERTEX_COLOR_DEFAULT_G.toString(16)
                    }${Visualizer.VERTEX_COLOR_DEFAULT_B.toString(16)}`
            }));
            this._graphics.link(() => Viva.Graph.View.webglLine(`#${Visualizer.EDGE_COLOR_DEFAULT.toString(16)
                }${Visualizer.EDGE_COLOR_DEFAULT.toString(16)
                }${Visualizer.EDGE_COLOR_DEFAULT.toString(16)}`));

            this._renderer = Viva.Graph.View.renderer(this._graph, {
                container: graphElem,
                graphics: this._graphics,
                layout,
                renderLinks: true
            });

            this._renderer.run();

            for (let i = 0; i < 12; i++) {
                this._renderer.zoomOut();
            }

            this._drawTimer = requestAnimationFrame(() => this.drawUpdates());
        }
    }

    /**
     * Draw any updates.
     */
    private drawUpdates(): void {
        if (this._graph && this._renderer && this._newTransactions.length > 0) {
            const txs = this._newTransactions.slice();
            this._newTransactions = [];

            const now = Date.now();

            for (const tx of txs) {
                if (!this._graph.getNode(tx.hash)) {
                    this._graph.beginUpdate();

                    const added: string[] = [];

                    this._graph.addNode(tx.hash, now);
                    added.push(tx.hash);

                    if (!this._graph.getNode(tx.trunk)) {
                        this._graph.addNode(tx.trunk, now);
                        added.push(tx.trunk);
                    }

                    this._graph.addLink(tx.trunk, tx.hash, now);

                    if (tx.trunk !== tx.branch) {
                        if (!this._graph.getNode(tx.branch)) {
                            this._graph.addNode(tx.branch, now);
                            added.push(tx.branch);
                        }

                        this._graph.addLink(tx.branch, tx.hash, now);
                    }

                    this._transactionHashes.push(...added);

                    while (this._transactionHashes.length > Visualizer.MAX_TRANSACTIONS) {
                        const nodeToRemove = this._transactionHashes.shift();
                        if (nodeToRemove && !added.includes(nodeToRemove)) {
                            this._graph.forEachLinkedNode(nodeToRemove, (linkedNode, link) => {
                                if (this._graph) {
                                    this._graph.removeLink(link);

                                    if (linkedNode.links.length === 0) {
                                        this._graph.removeNode(linkedNode.id);
                                    }
                                }
                            });
                            this._graph.removeNode(nodeToRemove);
                        }
                    }

                    this._graph.endUpdate();
                }
            }

            this._graph.forEachNode(node => {
                if (this._graphics) {
                    const nodeUI = this._graphics.getNodeUI(node.id);
                    if (nodeUI) {
                        const timeSince = Math.min(Math.round((now - node.data) / 10000), 20);
                        nodeUI.color = `0x${
                            (Visualizer.VERTEX_COLOR_DEFAULT_R + timeSince).toString(16)
                            }${(Visualizer.VERTEX_COLOR_DEFAULT_G + timeSince).toString(16)
                            }${(Visualizer.VERTEX_COLOR_DEFAULT_B + timeSince).toString(16)}`;
                    }
                }
            });
        }

        if (this._drawTimer) {
            this._drawTimer = requestAnimationFrame(() => this.drawUpdates());
        }
    }
}

export default Visualizer;
