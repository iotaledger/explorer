import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import Viva from "vivagraphjs";
import { buildCircleNodeShader } from "../../helpers/circleNodeShader";
import { UnitsHelper } from "../../helpers/unitsHelper";
import { IFeedItemChrysalis } from "../../models/api/og/IFeedItemChrysalis";
import { IFeedItemOg } from "../../models/api/og/IFeedItemOg";
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
    private static readonly EDGE_COLOR_LIGHT: number = 0x00000055;

    /**
     * Edge colour default.
     */
    private static readonly EDGE_COLOR_DARK: number = 0xFFFFFF11;

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
     * Vertex pending zero colour.
     */
    private static readonly COLOR_PENDING: string = "0xbbbbbb";

    /**
     * Vertex confirmed zero colour.
     */
    private static readonly COLOR_ZERO_CONFIRMED: string = "0x0fc1b7";

    /**
     * Vertex confirmed value colour.
     */
    private static readonly COLOR_VALUE_CONFIRMED: string = "0x3f985a";

    /**
     * Vertex milestone colour.
     */
    private static readonly COLOR_MILESTONE: string = "0xb8172d";

    /**
     * Vertex highlighted colour.
     */
    private static readonly COLOR_SEARCH_RESULT: string = "0xe79c18";

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
    private _newItems: (IFeedItemOg | IFeedItemChrysalis)[];

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
        this._newItems = [];
        this._newConfirmed = [];
        this._newMilestones = [];
        this._lastClick = 0;

        this._graphElement = null;
        this._resize = () => this.resize();

        this.state = {
            itemsPerSecond: "--",
            confirmedItemsPerSecond: "--",
            confirmedItemsPerSecondPercent: "--",
            itemsPerSecondHistory: [],
            items: [],
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
            filter: "",
            darkMode: this._settingsService.get().darkMode ?? false
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
            <div className={
                classNames("visualizer", { "dark-mode": this.state.darkMode })
            }
            >
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
                                    {
                                        filter: this._networkConfig?.protocolVersion === "og"
                                            ? e.target.value.toUpperCase()
                                            : e.target.value
                                    },
                                    () => this.restyleNodes())}
                                maxLength={this._networkConfig?.protocolVersion === "og" ? 90 : 2000}
                            />
                            <button
                                type="button"
                                className="card--action margin-l-s"
                                onClick={() => this.toggleMode()}
                            >
                                {this.state.darkMode ? "Light Mode" : "Dark Mode"}
                            </button>
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
                                {this._networkConfig?.protocolVersion === "chrysalis" ? "MPS / CMPS" : "TPS / CTPS"}
                            </div>
                            <div className="card--value">
                                {this.state.itemsPerSecond} / {this.state.confirmedItemsPerSecond}
                            </div>
                            <div className="card--label">
                                Confirmation Rate
                            </div>
                            <div className="card--value">
                                {this.state.confirmedItemsPerSecondPercent}
                            </div>
                        </div>
                        <div className="card--header">
                            <h2>Selected</h2>
                        </div>
                        <div className="card--content">
                            <div className="card--label">
                                {this._networkConfig?.protocolVersion === "og" ? "Transaction" : "Message"}
                            </div>
                            <div className="card--value overflow-ellipsis">
                                {this.state.selectedNode.length > 1 && (
                                    <a
                                        className="button"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={
                                            `${window.location.origin}/${this.props.match.params.network
                                            }/${this._networkConfig?.protocolVersion === "og"
                                                ? "transaction" : "message"}/${this.state.selectedNode}`
                                        }
                                    >
                                        {this.state.selectedNode}
                                    </a>
                                )}
                                {this.state.selectedNode.length === 1 && this.state.selectedNode}
                            </div>
                            {this._networkConfig?.protocolVersion === "og" && (
                                <React.Fragment>
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
                                </React.Fragment>
                            )}
                            {this.state.selectedMilestoneValue === "-" && (
                                <React.Fragment>
                                    <div className="card--label">
                                        {this._networkConfig?.protocolVersion === "og" ? "Tag" : "Index"}
                                    </div>
                                    <div className="card--value overflow-ellipsis">
                                        {this.state.selectedNodeTag.length > 1 && (
                                            <a
                                                className="button"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={
                                                    `${window.location.origin}/${this.props.match.params.network
                                                    }/${this._networkConfig?.protocolVersion === "og"
                                                        ? "tag" : "indexed"}/${this.state.selectedNodeTag}`
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
                            <div className="visualizer--key visualizer--key__value search-result">
                                Search Result
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
    protected itemsUpdated(transactions: IFeedItemOg[]): void {
        this._newItems = this._newItems.concat(transactions);
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

            this._graphics.node(node => this.calculateNodeStyle(
                node, this.testForHighlight(this.highlightNodesRegEx(), node.id, node.data)));

            this._graphics.link(() => Viva.Graph.View.webglLine(this.state.darkMode
                ? Visualizer.EDGE_COLOR_DARK : Visualizer.EDGE_COLOR_LIGHT));

            const events = Viva.Graph.webglInputEvents(this._graphics, this._graph);
            events.click(node => this.selectNode(node));

            events.mouseEnter(node => {
                if (this.state.selectedNode === "-") {
                    this.highlightConnections(node.id);
                }
            });

            events.mouseLeave(node => {
                if (this.state.selectedNode === "-") {
                    this.styleConnections();
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
        if (this._graph && this._renderer && this._newItems.length > 0) {
            const consumeLength = Math.floor(this._newItems.length / 50);
            const items = this._newItems.slice(0, consumeLength);
            this._newItems = this._newItems.slice(consumeLength);

            const confirmed = this._newConfirmed.slice();
            this._newConfirmed = [];
            const milestones = this._newMilestones.slice();
            this._newMilestones = [];

            const highlightRegEx = this.highlightNodesRegEx();

            const miHash: { [id: string]: number } = {};
            for (const ms of milestones) {
                miHash[ms.hash] = ms.milestoneIndex;

                const node = this._graph.getNode(ms.hash);
                if (node) {
                    node.data.milestone = ms.milestoneIndex;
                    this.styleNode(node, this.testForHighlight(highlightRegEx, node.id, node.data));
                }
            }

            for (const sn of confirmed) {
                const node = this._graph.getNode(sn);
                if (node) {
                    node.data.confirmed = true;
                    this.styleNode(node, this.testForHighlight(highlightRegEx, node.id, node.data));
                }
            }

            this._graph.beginUpdate();
            const added: string[] = [];

            for (const item of items) {
                const existingNode = this._graph.getNode(item.id);

                let tag;
                let address;
                let bundle;
                let p1;
                let p2;

                // eslint-disable-next-line no-prototype-builtins
                if (item.hasOwnProperty("parent1")) {
                    const og = item as IFeedItemChrysalis;
                    tag = og.indexationKey;
                    p1 = og.parent1;
                    p2 = og.parent2;
                } else {
                    const og = item as IFeedItemOg;
                    tag = og.tag;
                    address = og.address;
                    bundle = og.bundle;
                    p1 = og.trunk;
                    p2 = og.branch;
                }
                if (existingNode) {
                    const updatedData: INodeData = {
                        confirmed: confirmed.includes(item.id) || existingNode.data.confirmed,
                        value: item.value || existingNode.data.value,
                        tag: tag ?? existingNode.data.tag,
                        address: address ?? existingNode.data.address,
                        bundle: bundle ?? existingNode.data.bundle,
                        milestone: miHash[item.id] || existingNode.data.milestone
                    };
                    this._graph.addNode(item.id, updatedData);
                } else {
                    this._graph.addNode(item.id, {
                        confirmed: confirmed.includes(item.id),
                        value: item.value,
                        tag,
                        address,
                        bundle,
                        milestone: miHash[item.id]
                    });
                    added.push(item.id);

                    if (!this._graph.getNode(p1)) {
                        this._graph.addNode(p1, {
                            confirmed: confirmed.includes(item.id),
                            milestone: miHash[item.id]
                        });

                        added.push(p1);
                    }

                    this._graph.addLink(p1, item.id);

                    if (p1 !== p2) {
                        if (!this._graph.getNode(p2)) {
                            this._graph.addNode(p2, {
                                confirmed: confirmed.includes(item.id),
                                milestone: miHash[item.id]
                            });
                            added.push(p2);
                        }

                        this._graph.addLink(p2, item.id);
                    }
                }
            }

            this._graph.endUpdate();

            this._transactionHashes.push(...added);

            this._graph.beginUpdate();
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

        if (this._drawTimer) {
            this._drawTimer = requestAnimationFrame(() => this.drawUpdates());
        }
    }

    /**
     * Style the node.
     * @param node The node to style.
     * @param highlight Highlight the node.
     */
    private styleNode(node: Viva.Graph.INode<INodeData> | undefined, highlight: boolean): void {
        if (this._graphics && node) {
            const nodeUI = this._graphics.getNodeUI(node.id);
            if (nodeUI) {
                const { color, size } = this.calculateNodeStyle(node, highlight);
                nodeUI.color = color;
                nodeUI.size = size;
            }
        }
    }

    /**
     * Style the node.
     * @param node The node to style.
     * @param highlight Highlight the node.
     * @returns The size and color for the node.
     */
    private calculateNodeStyle(node: Viva.Graph.INode<INodeData> | undefined, highlight: boolean): {
        color: string;
        size: number;
    } {
        let color = Visualizer.COLOR_PENDING;
        let size = Visualizer.VERTEX_SIZE_REGULAR;

        if (node) {
            if (highlight) {
                color = Visualizer.COLOR_SEARCH_RESULT;
            } else if (node.data.milestone) {
                color = Visualizer.COLOR_MILESTONE;
            } else if (node.data.confirmed) {
                color = node.data.value !== 0 && node.data.value !== undefined
                    ? Visualizer.COLOR_VALUE_CONFIRMED
                    : Visualizer.COLOR_ZERO_CONFIRMED;
            } else {
                color = Visualizer.COLOR_PENDING;
            }

            size = node.data.milestone || (node.data.value !== 0 && node.data.value !== undefined)
                ? Visualizer.VERTEX_SIZE_LARGE
                : Visualizer.VERTEX_SIZE_REGULAR;
        }

        return {
            color,
            size
        };
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

        this.styleConnections();

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
        if (this._graph) {
            this._graph.beginUpdate();

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

            this._graph.endUpdate();
        }
    }

    /**
     * Style the connections as default colors.
     */
    private styleConnections(): void {
        if (this._graph) {
            this._graph.beginUpdate();

            this._graph?.forEachLink((link: Viva.Graph.ILink<unknown>) => {
                const linkUI = this._graphics?.getLinkUI(link.id);
                if (linkUI) {
                    linkUI.color = this.state.darkMode
                        ? Visualizer.EDGE_COLOR_DARK
                        : Visualizer.EDGE_COLOR_LIGHT;
                }
            });

            this._graph.endUpdate();
        }
    }

    /**
     * Restyle all the nodes.
     */
    private restyleNodes(): void {
        const regEx = this.highlightNodesRegEx();

        if (this._graph) {
            this._graph.beginUpdate();

            this._graph?.forEachNode((node: Viva.Graph.INode<INodeData>) => {
                this.styleNode(node, this.testForHighlight(regEx, node.id, node.data));
            });

            this._graph.endUpdate();
        }
    }

    /**
     * Highlight nodes regex.
     * @returns The reg exp for highlighting.
     */
    private highlightNodesRegEx(): RegExp | undefined {
        const trimmedFilter = this.state.filter.trim();

        if (trimmedFilter.length > 0) {
            return new RegExp(trimmedFilter);
        }
    }

    /**
     * Highlight nodes.
     * @param regEx The pattern to match in the properties.
     * @param nodeId The node to match the data.
     * @param data The data node to match.
     * @returns True if we should highlight the node.
     */
    private testForHighlight(
        regEx: RegExp | undefined,
        nodeId: string | undefined,
        data: INodeData | undefined): boolean {
        if (!regEx || !nodeId || !data) {
            return false;
        }

        if (regEx.test(nodeId)) {
            return true;
        }

        if (data.tag && regEx.test(data.tag)) {
            return true;
        }

        if (data.address && regEx.test(data.address)) {
            return true;
        }

        if (data.bundle && regEx.test(data.bundle)) {
            return true;
        }

        return false;
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

    /**
     * Toggle the display mode.
     */
    private toggleMode(): void {
        this.setState({
            darkMode: !this.state.darkMode
        }, () => {
            this._settingsService.saveSingle("darkMode", this.state.darkMode);
            this.styleConnections();
        });
    }
}

export default Visualizer;
