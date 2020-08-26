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
    private static readonly EDGE_COLOR_DEFAULT: string = "#EEEEEE";

    /**
     * Vertex size.
     */
    private static readonly VERTEX_SIZE_ZERO: number = 20;

    /**
     * Vertex size.
     */
    private static readonly VERTEX_SIZE_VALUE: number = 30;

    /**
     * Vertex confirmed value colour.
     */
    private static readonly COLOR_VALUE_CONFIRMED: string = "0xe79c18";

    /**
     * Vertex pending zero colour.
     */
    private static readonly COLOR_PENDING: string = "0x8493ad";

    /**
     * Vertex confirmed zero colour.
     */
    private static readonly COLOR_ZERO_CONFIRMED: string = "0x0fc1b7";

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
    private readonly _transactionHashes: {
        /**
         * The hash of the transactions.
         */
        hash: string;
        /**
         * Is it confirmed.
         */
        confirmed: boolean;
    }[];

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
     * New confirmed transactions.
     */
    private _newConfirmed: string[];

    /**
     * Timer for display updates.
     */
    private _drawTimer?: number;

    /**
     * The resize method
     */
    private readonly _resize: () => void;

    /**
     * The graph element.
     */
    private _graphElement: HTMLElement | null;

    /**
     * Create a new instance of Visualizer.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<VisualizerRouteProps>) {
        super(props);

        this._transactionHashes = [];
        this._newTransactions = [];
        this._newConfirmed = [];

        this._graphElement = null;
        this._resize = () => this.resize();

        this.state = {
            transactionsPerSecond: "--",
            confirmedTransactionsPerSecond: "--",
            confirmedTransactionsPerSecondPercent: "--",
            transactionsPerSecondHistory: [],
            transactions: [],
            confirmed: [],
            milestones: [],
            currency: "USD",
            currencies: [],
            transactionCount: 0,
            selectedNode: "-",
            selectedNodeValue: "-"
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        window.addEventListener("resize", this._resize);

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
        this._graphElement = null;
        window.removeEventListener("resize", this._resize);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="visualizer">
                <h1 className="margin-r-t margin-b-t">Visualizer</h1>
                <div className="row middle space-between row--tablet-responsive">
                    <div className="row middle visualizer-container margin-b-t">
                        <span className="visualizer-label margin-r-t">Transactions</span>
                        <span className="visualizer-value">
                            {this.state.transactionCount}
                        </span>
                    </div>
                    <div className="row middle visualizer-container margin-b-t">
                        <span className="visualizer-label margin-r-t">TPS</span>
                        <span className="visualizer-value">
                            {this.state.transactionsPerSecond} / {this.state.confirmedTransactionsPerSecond}
                        </span>
                    </div>
                    <div className="row middle visualizer-container margin-b-t">
                        <span className="visualizer-label margin-r-t">Confirmation Rate</span>
                        <span className="visualizer-value">
                            {this.state.confirmedTransactionsPerSecondPercent}
                        </span>
                    </div>
                </div>
                <div className="graph-border">
                    <div
                        className="viva"
                        ref={r => this.setupGraph(r)}
                    />
                </div>
                <div className="row row--tablet-responsive middle space-between">
                    <div className="row middle margin-t-s">
                        <span className="visualizer-label margin-r-t">Selected</span>
                        <span className="visualizer-value visualizer-value__small">
                            {this.state.selectedNode}
                        </span>
                    </div>
                    <div className="row middle margin-t-s">
                        <span className="visualizer-label margin-r-t">Value</span>
                        <span className="visualizer-value">
                            {this.state.selectedNodeValue}
                        </span>
                    </div>
                </div>
                <div className="row row--tablet-responsive middle space-between">
                    <div className="row middle wrap">
                        <div className="visualizer--key visualizer--key__label margin-t-t">Key</div>
                        <div className="visualizer--key visualizer--key__value pending margin-t-t">
                            Pending
                        </div>
                        <div className="visualizer--key visualizer--key__value confirmed-value margin-t-t">
                            Value Confirmed
                        </div>
                        <div className="visualizer--key visualizer--key__value confirmed-zero margin-t-t">
                            Zero Confirmed
                        </div>
                        <div className="visualizer--key margin-t-t">Value transactions are shown larger.</div>
                    </div>
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
     * The confirmed transactions have been updated.
     * @param confirmed The updated confirmed transactions.
     */
    protected confirmedUpdated(confirmed: string[]): void {
        this._newConfirmed = this._newConfirmed.concat(confirmed);
    }

    /**
     * Setup the graph.
     * @param graphElem The element to use.
     */
    private setupGraph(graphElem: HTMLElement | null): void {
        this._graphElement = graphElem;

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

            this._graphics.node(node => ({
                size: node.data.value === 0 ? Visualizer.VERTEX_SIZE_ZERO : Visualizer.VERTEX_SIZE_VALUE,
                color: Visualizer.COLOR_PENDING
            }));
            this._graphics.link(() => Viva.Graph.View.webglLine(Visualizer.EDGE_COLOR_DEFAULT));

            const events = Viva.Graph.webglInputEvents(this._graphics, this._graph);
            events.click(node => {
                this.setState({
                    selectedNode: this.state.selectedNode === node.id ? "-" : node.id,
                    selectedNodeValue: this.state.selectedNode === node.id ? "-" : node.data.value
                });
            });

            this._renderer = Viva.Graph.View.renderer(this._graph, {
                container: graphElem,
                graphics: this._graphics,
                layout,
                renderLinks: true
            });

            this._renderer.run();

            this._graphics.scale(1, { x: graphElem.clientWidth / 2, y: graphElem.clientHeight / 2 });

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
            const consumeLength = Math.floor(this._newTransactions.length / 50);
            const txs = this._newTransactions.slice(0, consumeLength);
            this._newTransactions = this._newTransactions.slice(consumeLength);

            const confirmed = this._newConfirmed.slice();
            this._newConfirmed = [];

            for (const sn of confirmed) {
                const node = this._graph.getNode(sn);
                if (node) {
                    node.data.confirmed = true;
                }
            }

            for (const tx of txs) {
                if (!this._graph.getNode(tx.hash)) {
                    this._graph.beginUpdate();

                    const added: string[] = [];

                    this._graph.addNode(tx.hash, { confirmed: false, value: tx.value });
                    added.push(tx.hash);

                    if (!this._graph.getNode(tx.trunk)) {
                        this._graph.addNode(tx.trunk, { confirmed: false, value: 0 });
                        added.push(tx.trunk);
                    }

                    this._graph.addLink(tx.trunk, tx.hash);

                    if (tx.trunk !== tx.branch) {
                        if (!this._graph.getNode(tx.branch)) {
                            this._graph.addNode(tx.branch, { confirmed: false, value: 0 });
                            added.push(tx.branch);
                        }

                        this._graph.addLink(tx.branch, tx.hash);
                    }

                    this._transactionHashes.push(...added.map(a => ({ hash: a, confirmed: false })));

                    while (this._transactionHashes.length > Visualizer.MAX_TRANSACTIONS) {
                        const nodeToRemove = this._transactionHashes.shift();
                        if (nodeToRemove && !added.includes(nodeToRemove.hash)) {
                            this._graph.forEachLinkedNode(nodeToRemove.hash, (linkedNode, link) => {
                                if (this._graph) {
                                    this._graph.removeLink(link);

                                    if (linkedNode.links.length === 0) {
                                        this._graph.removeNode(linkedNode.id);
                                    }
                                }
                            });
                            this._graph.removeNode(nodeToRemove.hash);
                        }
                    }

                    this._graph.endUpdate();

                    this.setState({ transactionCount: this._transactionHashes.length });
                }
            }

            this._graph.forEachNode(node => {
                if (this._graphics) {
                    const nodeUI = this._graphics.getNodeUI(node.id);
                    if (nodeUI) {
                        nodeUI.color = node.data.confirmed
                            ? (node.data.value === 0
                                ? Visualizer.COLOR_ZERO_CONFIRMED : Visualizer.COLOR_VALUE_CONFIRMED)
                            : Visualizer.COLOR_PENDING;
                    }
                }
            });
        }

        if (this._drawTimer) {
            this._drawTimer = requestAnimationFrame(() => this.drawUpdates());
        }
    }

    /**
     * The window was resized.
     */
    private resize(): void {
        if (this._graphElement) {
            if (this._graphics) {
                this._graphics.updateSize();
                this._graphics.scale(1,
                    { x: this._graphElement.clientWidth / 2, y: this._graphElement.clientHeight / 2 });
            }
        }
    }
}

export default Visualizer;
