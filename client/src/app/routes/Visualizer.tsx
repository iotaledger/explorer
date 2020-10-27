import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import Viva from "vivagraphjs";
import { buildCircleNodeShader } from "../../helpers/circleNodeShader";
import { UnitsHelper } from "../../helpers/unitsHelper";
import { IFeedTransaction } from "../../models/api/IFeedTransaction";
import { INodeData } from "../../models/graph/INodeData";
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
     * Edge colour default.
     */
    private static readonly EDGE_COLOR_DEFAULT: number = 0xEEEEEEFF;

    /**
     * Edge color confirming.
     */
    private static readonly EDGE_COLOR_CONFIRMING: number = 0x00FF00FF;

    /**
     * Edge color confirmed by.
     */
    private static readonly EDGE_COLOR_CONFIRMED_BY: number = 0xFFA500FF;

    /**
     * Vertex size.
     */
    private static readonly VERTEX_SIZE_REGULAR: number = 20;

    /**
     * Vertex size.
     */
    private static readonly VERTEX_SIZE_LARGE: number = 30;

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
     * Vertex milestone colour.
     */
    private static readonly COLOR_MILESTONE: string = "0xb8172d";

    /**
     * Vertex highlighted colour.
     */
    private static readonly COLOR_HIGHLIGHTED: string = "0x0000ff";

    /**
     * The graph instance.
     */
    private _graph?: Viva.Graph.IGraph<INodeData, unknown>;

    /**
     * The renderer instance.
     */
    private _renderer?: Viva.Graph.View.IRenderer;

    /**
     * The graphics instance.
     */
    private _graphics?: Viva.Graph.View.IWebGLGraphics<INodeData, unknown>;

    /**
     * All the transactions to vizualise.
     */
    private readonly _transactionHashes: string[];

    /**
     * New transactions to process.
     */
    private _newTransactions: IFeedTransaction[];

    /**
     * New confirmed transactions.
     */
    private _newConfirmed: string[];

    /**
     * New confirmed transactions.
     */
    private _newMilestones: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];

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
     * Last time a node was clicked.
     */
    private _lastClick: number;

    /**
     * Create a new instance of Visualizer.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<VisualizerRouteProps>) {
        super(props);

        this._transactionHashes = [];
        this._newTransactions = [];
        this._newConfirmed = [];
        this._newMilestones = [];
        this._lastClick = 0;

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
            selectedNodeValue: "-",
            selectedNodeTag: "-",
            selectedNodeAddress: "-",
            selectedNodeBundle: "-",
            selectedMilestoneValue: "-",
            filter: ""
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
                <div className="row middle">
                    <h1 className="margin-r-t margin-b-t">Visualizer</h1>
                    <div className="card margin-b-s filter fill">
                        <div className="card--content row middle">
                            <div className="card--label margin-r-s">
                                Search
                            </div>
                            <input
                                className="input form-input-long"
                                type="text"
                                value={this.state.filter}
                                onChange={e => this.setState(
                                    { filter: e.target.value.toUpperCase() },
                                    () => this.highlightNodes())}
                                maxLength={90}
                            />
                        </div>
                    </div>
                </div>
                <div className="row stretch">
                    <div className="sidepanel-border card phone-hidden margin-r-s">
                        <div className="card--header">
                            <h2>Statistics</h2>
                        </div>
                        <div className="card--content">
                            <div className="card--label">
                                Transactions
                            </div>
                            <div className="card--value">
                                {this.state.transactionCount}
                            </div>
                            <div className="card--label">
                                TPS / CTPS
                            </div>
                            <div className="card--value">
                                {this.state.transactionsPerSecond} / {this.state.confirmedTransactionsPerSecond}
                            </div>
                            <div className="card--label">
                                Confirmation Rate
                            </div>
                            <div className="card--value">
                                {this.state.confirmedTransactionsPerSecondPercent}
                            </div>
                        </div>
                        <div className="card--header">
                            <h2>Selected</h2>
                        </div>
                        <div className="card--content">
                            <div className="card--label">
                                Transaction
                            </div>
                            <div className="card--value overflow-ellipsis">
                                {this.state.selectedNode.length > 1 && (
                                    <a
                                        className="button"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={
                                            `${window.location.origin}/${this.props.match.params.network
                                            }/transaction/${this.state.selectedNode}`
                                        }
                                    >
                                        {this.state.selectedNode}
                                    </a>
                                )}
                                {this.state.selectedNode.length === 1 && this.state.selectedNode}
                            </div>
                            <div className="card--label">
                                Address
                            </div>
                            <div className="card--value overflow-ellipsis">
                                {this.state.selectedNodeAddress.length > 1 && (
                                    <a
                                        className="button"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={
                                            `${window.location.origin}/${this.props.match.params.network
                                            }/address/${this.state.selectedNodeAddress}`
                                        }
                                    >
                                        {this.state.selectedNodeAddress}
                                    </a>
                                )}
                                {this.state.selectedNodeAddress.length === 1 && this.state.selectedNodeAddress}
                            </div>
                            <div className="card--label">
                                Bundle
                            </div>
                            <div className="card--value overflow-ellipsis">
                                {this.state.selectedNodeBundle.length > 1 && (
                                    <a
                                        className="button"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={
                                            `${window.location.origin}/${this.props.match.params.network
                                            }/bundle/${this.state.selectedNodeBundle}`
                                        }
                                    >
                                        {this.state.selectedNodeBundle}
                                    </a>
                                )}
                                {this.state.selectedNodeBundle.length === 1 && this.state.selectedNodeBundle}
                            </div>
                            {this.state.selectedMilestoneValue === "-" && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Tag
                                    </div>
                                    <div className="card--value overflow-ellipsis">
                                        {this.state.selectedNodeTag.length > 1 && (
                                            <a
                                                className="button"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={
                                                    `${window.location.origin}/${this.props.match.params.network
                                                    }/tag/${this.state.selectedNodeTag}`
                                                }
                                            >
                                                {this.state.selectedNodeTag}
                                            </a>
                                        )}
                                        {this.state.selectedNodeTag.length === 1 && this.state.selectedNodeTag}
                                    </div>
                                </React.Fragment>
                            )}
                            {this.state.selectedMilestoneValue !== "-" && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Milestone
                                    </div>
                                    <div className="card--value">
                                        {this.state.selectedMilestoneValue}
                                    </div>
                                </React.Fragment>
                            )}
                            {this.state.selectedMilestoneValue === "-" && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Value
                                    </div>
                                    <div className="card--value">
                                        {this.state.selectedNodeValue}
                                    </div>
                                </React.Fragment>
                            )}

                        </div>
                    </div>
                    <div className="graph-border">
                        <div
                            className="viva"
                            onClick={() => {
                                if (Date.now() - this._lastClick > 300) {
                                    this.selectNode();
                                }
                            }}
                            ref={r => this.setupGraph(r)}
                        />
                    </div>
                </div>
                <div className="row middle margin-t-s">
                    <div className="card key fill">
                        <div className="card--content row row--tablet-responsive middle wrap">
                            <div className="card--label margin-r-s margin-b-t">
                                Key
                            </div>
                            <div className="visualizer--key visualizer--key__value pending">
                                Pending
                            </div>
                            <div
                                className="visualizer--key visualizer--key__value confirmed-value"
                            >
                                Value Confirmed
                            </div>
                            <div
                                className="visualizer--key visualizer--key__value confirmed-zero"
                            >
                                Zero Confirmed
                            </div>
                            <div className="visualizer--key visualizer--key__value milestone">
                                Milestone
                            </div>
                            <p className="margin-t-t margin-b-t">
                                Value transactions and Milestones are displayed as larger nodes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * The transactions have been updated.
     * @param transactions The updated transactions.
     */
    protected transactionsUpdated(transactions: IFeedTransaction[]): void {
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
     * The milestones were updated.
     * @param milestones The list of miletsones.
     */
    protected milestonesUpdated(milestones: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[]): void {
        this._newMilestones = milestones;
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
                size: node.data.milestone || (node.data.value !== 0 && node.data.value !== undefined)
                    ? Visualizer.VERTEX_SIZE_LARGE : Visualizer.VERTEX_SIZE_REGULAR,
                color: Visualizer.COLOR_PENDING
            }));
            this._graphics.link(() => Viva.Graph.View.webglLine(Visualizer.EDGE_COLOR_DEFAULT));

            const events = Viva.Graph.webglInputEvents(this._graphics, this._graph);
            events.click(node => this.selectNode(node));

            events.mouseEnter(node => {
                if (this.state.selectedNode === "-") {
                    this.highlightConnections(node.id);
                }
            });

            events.mouseLeave(node => {
                if (this.state.selectedNode === "-") {
                    this.clearConnections();
                }
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
                    this.styleNode(node);
                }
            }

            const milestones = this._newMilestones.slice();
            this._newMilestones = [];

            for (const ms of milestones) {
                const node = this._graph.getNode(ms.hash);
                if (node) {
                    node.data.milestone = ms.milestoneIndex;
                    this.styleNode(node);
                }
            }

            for (const tx of txs) {
                if (!this._graph.getNode(tx.hash)) {
                    this._graph.beginUpdate();

                    const added: string[] = [];

                    this._graph.addNode(tx.hash, {
                        confirmed: false,
                        value: tx.value,
                        tag: tx.tag,
                        address: tx.address,
                        bundle: tx.bundle
                    });
                    added.push(tx.hash);

                    if (!this._graph.getNode(tx.trunk)) {
                        this._graph.addNode(tx.trunk, {});

                        added.push(tx.trunk);
                    }

                    this._graph.addLink(tx.trunk, tx.hash);

                    if (tx.trunk !== tx.branch) {
                        if (!this._graph.getNode(tx.branch)) {
                            this._graph.addNode(tx.branch, {});
                            added.push(tx.branch);
                        }

                        this._graph.addLink(tx.branch, tx.hash);
                    }

                    for (const add of added) {
                        this._transactionHashes.push(add);
                        const node = this._graph.getNode(add);
                        this.styleNode(node);
                    }

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

                    this.setState({ transactionCount: this._transactionHashes.length });
                }
            }
        }

        if (this._drawTimer) {
            this._drawTimer = requestAnimationFrame(() => this.drawUpdates());
        }
    }

    /**
     * Style the node.
     * @param node The node to style.
     */
    private styleNode(node: Viva.Graph.INode<INodeData> | undefined): void {
        if (this._graphics && node) {
            const nodeUI = this._graphics.getNodeUI(node.id);
            if (nodeUI) {
                if (node.data.milestone) {
                    nodeUI.color = Visualizer.COLOR_MILESTONE;
                    nodeUI.size = Visualizer.VERTEX_SIZE_LARGE;
                } else if (node.data.confirmed) {
                    nodeUI.color = Visualizer.COLOR_ZERO_CONFIRMED;
                    if (node.data.value === undefined || node.data.value === 0) {
                        nodeUI.size = Visualizer.VERTEX_SIZE_REGULAR;
                    } else {
                        nodeUI.size = Visualizer.VERTEX_SIZE_LARGE;
                    }
                } else {
                    nodeUI.color = Visualizer.COLOR_PENDING;
                    if (node.data.value === undefined || node.data.value === 0) {
                        nodeUI.size = Visualizer.VERTEX_SIZE_REGULAR;
                    } else {
                        nodeUI.size = Visualizer.VERTEX_SIZE_LARGE;
                    }
                }
            }
        }
    }

    /**
     * Get the connections from the node.
     * @param node The node starting point.
     * @param field The field to use for direction.
     * @returns The list of connection ids.
     */
    private getNodeConnections(node: string, field: "fromId" | "toId"): string[] {
        const nodesToProcess: string[] = [node];
        const usedNodes: string[] = [node];
        const connections: string[] = [];

        while (nodesToProcess.length > 0) {
            const currentNode = nodesToProcess.shift();
            if (currentNode) {
                this._graph?.forEachLinkedNode(currentNode, (connectedNode, link) => {
                    if (link[field] === currentNode && !usedNodes.includes(connectedNode.id)) {
                        connections.push(link.id);
                        nodesToProcess.push(connectedNode.id);
                        usedNodes.push(connectedNode.id);
                    }
                });
            }
        }

        return connections;
    }

    /**
     * Select the clicked node.
     * @param node The node to select.
     */
    private selectNode(node?: Viva.Graph.INode<INodeData>): void {
        const isDeselect = !node || this.state.selectedNode === node.id;
        this.setState({
            selectedNode: isDeselect || !node ? "-" : node.id,
            selectedNodeValue: isDeselect || !node || node.data.value === undefined
                ? "-"
                : UnitsHelper.formatBest(node.data.value),
            selectedNodeAddress: isDeselect || !node || node.data.address === undefined
                ? "-"
                : node.data.address,
            selectedNodeBundle: isDeselect || !node || node.data.bundle === undefined
                ? "-"
                : node.data.bundle,
            selectedNodeTag: isDeselect || !node || node.data.tag === undefined
                ? "-"
                : node.data.tag,
            selectedMilestoneValue: isDeselect || !node || node.data.milestone === undefined
                ? "-"
                : node.data.milestone.toString()
        });

        this.clearConnections();

        if (!isDeselect && node) {
            this.highlightConnections(node.id);
        }

        this._lastClick = Date.now();
    }

    /**
     * Highlight the forward and backwards cones.
     * @param nodeId The node to highlight.
     */
    private highlightConnections(nodeId: string): void {
        const confirming = this.getNodeConnections(nodeId, "toId");
        for (const confirm of confirming) {
            const linkUI = this._graphics?.getLinkUI(confirm);
            if (linkUI) {
                linkUI.color = Visualizer.EDGE_COLOR_CONFIRMING;
            }
        }

        const confirmedBy = this.getNodeConnections(nodeId, "fromId");
        for (const confirm of confirmedBy) {
            const linkUI = this._graphics?.getLinkUI(confirm);
            if (linkUI) {
                linkUI.color = Visualizer.EDGE_COLOR_CONFIRMED_BY;
            }
        }
    }

    /**
     * Clear the forward and backwards cones.
     */
    private clearConnections(): void {
        this._graph?.forEachLink((link: Viva.Graph.ILink<unknown>) => {
            const linkUI = this._graphics?.getLinkUI(link.id);
            if (linkUI) {
                linkUI.color = Visualizer.EDGE_COLOR_DEFAULT;
            }
        });
    }

    /**
     * Highlight nodes.
     */
    private highlightNodes(): void {
        const trimmedFilter = this.state.filter.trim();
        const regEx = new RegExp(trimmedFilter, "g");

        this._graph?.forEachNode((node: Viva.Graph.INode<INodeData>) => {
            if (trimmedFilter.length > 0 &&
                (
                    regEx.test(node.id) ||
                    regEx.test(node.data.tag || "") ||
                    regEx.test(node.data.address || "") ||
                    regEx.test(node.data.bundle || "")
                )) {
                const linkUI = this._graphics?.getNodeUI(node.id);
                if (linkUI) {
                    linkUI.color = Visualizer.COLOR_HIGHLIGHTED;
                }
            } else {
                this.styleNode(node);
            }
        });
    }

    /**
     * The window was resized.
     */
    private resize(): void {
        if (this._graphElement) {
            if (this._graphics) {
                this._graphics.updateSize();
                this._graphics.scale(1, {
                    x: this._graphElement.clientWidth / 2,
                    y: this._graphElement.clientHeight / 2
                }
                );
            }
        }
    }
}

export default Visualizer;
