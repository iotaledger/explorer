import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import Viva from "vivagraphjs";
import { buildCircleNodeShader } from "../../helpers/circleNodeShader";
import { UnitsHelper } from "../../helpers/unitsHelper";
import { INodeData } from "../../models/graph/INodeData";
import { IFeedItem } from "../../models/IFeedItem";
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
    private readonly _existingIds: string[];

    /**
     * New transactions to process.
     */
    private _newItems: IFeedItem[];

    /**
     * New confirmed transactions.
     */
    private _newConfirmed: string[];

    /**
     * Existing milestones.
     */
    private _msIndexToNode: {
        [index: number]: {
            id: string;
            lastSeen: number;
        };
    };

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

        this._existingIds = [];
        this._newItems = [];
        this._newConfirmed = [];
        this._msIndexToNode = {};
        this._lastClick = 0;

        this._graphElement = null;
        this._resize = () => this.resize();

        this.state = {
            itemsPerSecond: "--",
            confirmedItemsPerSecond: "--",
            confirmedItemsPerSecondPercent: "--",
            itemsPerSecondHistory: [],
            confirmed: [],
            milestones: [],
            currency: "USD",
            currencies: [],
            transactionCount: 0,
            selectedFeedItem: undefined,
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
                        {this.state.selectedFeedItem && (
                            <React.Fragment>
                                <div className="card--header">
                                    <h2>Selected</h2>
                                </div>
                                <div className="card--content">
                                    <div className="card--label">
                                        {this._networkConfig?.protocolVersion === "og" ? "Transaction" : "Message"}
                                    </div>
                                    <div className="card--value overflow-ellipsis">
                                        <a
                                            className="button"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={
                                                `${window.location.origin}/${this.props.match.params.network
                                                }/${this._networkConfig?.protocolVersion === "og"
                                                    ? "transaction" : "message"}/${this.state.selectedFeedItem.id}`
                                            }
                                        >
                                            {this.state.selectedFeedItem.id}
                                        </a>
                                    </div>
                                    {this._networkConfig?.protocolVersion === "og" && (
                                        <React.Fragment>
                                            {this.state.selectedFeedItem?.metaData?.Address && (
                                                <React.Fragment>
                                                    <div className="card--label">
                                                        Address
                                                    </div>
                                                    <div className="card--value overflow-ellipsis">
                                                        <a
                                                            className="button"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={
                                                                `${window.location.origin
                                                                }/${this.props.match.params.network
                                                                }/address/${this
                                                                    .state.selectedFeedItem?.metaData.Address}`
                                                            }
                                                        >
                                                            {this.state.selectedFeedItem?.metaData.Address as string}
                                                        </a>
                                                    </div>
                                                </React.Fragment>
                                            )}
                                            {this.state.selectedFeedItem?.metaData?.Bundle && (
                                                <React.Fragment>
                                                    <div className="card--label">
                                                        Bundle
                                                    </div>
                                                    <div className="card--value overflow-ellipsis">
                                                        <a
                                                            className="button"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={
                                                                `${window.location.origin
                                                                }/${this.props.match.params.network
                                                                }/bundle/${this
                                                                    .state.selectedFeedItem?.metaData.Bundle}`
                                                            }
                                                        >
                                                            {this.state.selectedFeedItem?.metaData.Bundle as string}
                                                        </a>
                                                    </div>
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    )}
                                    {this.state.selectedFeedItem?.metaData?.Tag &&
                                        this.state.selectedFeedItem?.metaData?.MS === undefined && (
                                            <React.Fragment>
                                                <div className="card--label">
                                                    Tag
                                                </div>
                                                <div className="card--value overflow-ellipsis">
                                                    <a
                                                        className="button"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        href={
                                                            `${window.location.origin}/${this.props.match.params.network
                                                            }/tag/${this.state.selectedFeedItem?.metaData.Tag}`
                                                        }
                                                    >
                                                        {this.state.selectedFeedItem?.metaData.Tag as string}
                                                    </a>
                                                </div>
                                            </React.Fragment>
                                        )}
                                    {this.state.selectedFeedItem?.metaData?.Index && (
                                        <React.Fragment>
                                            <div className="card--label">
                                                Index
                                            </div>
                                            <div className="card--value overflow-ellipsis">
                                                <a
                                                    className="button"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={
                                                        `${window.location.origin}/${this.props.match.params.network
                                                        }/indexed/${this.state.selectedFeedItem?.metaData.Index}`
                                                    }
                                                >
                                                    {this.state.selectedFeedItem?.metaData.Index as string}
                                                </a>
                                            </div>
                                        </React.Fragment>
                                    )}
                                    {this.state.selectedFeedItem?.metaData?.MS !== undefined && (
                                        <React.Fragment>
                                            <div className="card--label">
                                                Milestone
                                            </div>
                                            <div className="card--value">
                                                {this.state.selectedFeedItem?.metaData.MS as number}
                                            </div>
                                        </React.Fragment>
                                    )}
                                    {this.state.selectedFeedItem?.value !== undefined &&
                                        this.state.selectedFeedItem?.metaData?.MS === undefined && (
                                            <React.Fragment>
                                                <div className="card--label">
                                                    Value
                                                </div>
                                                <div className="card--value">
                                                    {UnitsHelper.formatBest(this.state.selectedFeedItem?.value)}
                                                </div>
                                            </React.Fragment>
                                        )}
                                </div>
                            </React.Fragment>
                        )}
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
     * The items have been updated.
     * @param newItems The updated items.
     */
    protected itemsUpdated(newItems: IFeedItem[]): void {
        this._newItems = this._newItems.concat(newItems);

        if (this._networkConfig?.protocolVersion === "chrysalis") {
            // For chrysalis networks the milestones message id is extracted from messages

            let changed = false;
            for (const message of this._newItems) {
                if (message.metaData?.MS) {
                    this._msIndexToNode[message.metaData?.MS as number] = {
                        id: message.id,
                        lastSeen: Date.now()
                    };
                    changed = true;
                }
            }

            if (changed) {
                this.highlightMilestones();
            }
        }
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
         * The id.
         */
        id: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[]): void {
        if (this._networkConfig?.protocolVersion === "og") {
            // For OG networks the milestones have the index and tx hash
            for (const ms of milestones) {
                this._msIndexToNode[ms.milestoneIndex] = {
                    id: ms.id,
                    lastSeen: Date.now()
                };
            }

            this.highlightMilestones();
        }
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
                if (!this.state.selectedFeedItem) {
                    this.highlightConnections(node.id);
                }
            });

            events.mouseLeave(node => {
                if (!this.state.selectedFeedItem) {
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
            const consumeLength = Math.min(this._newItems.length, 10);
            const items = this._newItems.slice(0, consumeLength);
            this._newItems = this._newItems.slice(consumeLength);

            const confirmed = this._newConfirmed.slice();
            this._newConfirmed = [];

            const highlightRegEx = this.highlightNodesRegEx();

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

                if (existingNode) {
                    const updatedData: INodeData = {
                        confirmed: confirmed.includes(item.id) || existingNode.data.confirmed,
                        feedItem: item
                    };
                    this._graph.addNode(item.id, updatedData);
                } else {
                    this._graph.addNode(item.id, {
                        confirmed: confirmed.includes(item.id),
                        feedItem: item
                    });
                    added.push(item.id);

                    if (item.parent1) {
                        if (!this._graph.getNode(item.parent1)) {
                            this._graph.addNode(item.parent1, {
                                confirmed: confirmed.includes(item.id),
                                feedItem: {
                                    id: item.parent1
                                }
                            });

                            added.push(item.parent1);
                        }

                        this._graph.addLink(item.parent1, item.id);
                    }

                    if (item.parent2 && item.parent1 !== item.parent2) {
                        if (!this._graph.getNode(item.parent2)) {
                            this._graph.addNode(item.parent2, {
                                confirmed: confirmed.includes(item.id),
                                feedItem: {
                                    id: item.parent2
                                }
                            });
                            added.push(item.parent2);
                        }

                        this._graph.addLink(item.parent2, item.id);
                    }
                }
            }

            this._graph.endUpdate();

            this._existingIds.push(...added);

            this._graph.beginUpdate();
            while (this._existingIds.length > Visualizer.MAX_TRANSACTIONS) {
                const nodeToRemove = this._existingIds.shift();
                if (nodeToRemove && !added.includes(nodeToRemove)) {
                    this._graph.forEachLinkedNode(nodeToRemove, (linkedNode, link) => {
                        if (this._graph) {
                            this._graph.removeLink(link);

                            if (linkedNode.links.length === 0) {
                                this._graph.removeNode(linkedNode.id);
                                if (linkedNode.data.feedItem.metaData?.MS) {
                                    delete this._msIndexToNode[linkedNode.data.feedItem.metaData?.MS as number];
                                }
                            }
                        }
                    });
                    this._graph.removeNode(nodeToRemove);
                    const removeNode = this._graph.getNode(nodeToRemove);

                    if (removeNode?.data.feedItem.metaData?.MS) {
                        delete this._msIndexToNode[removeNode?.data.feedItem.metaData?.MS as number];
                    }
                }
            }
            this._graph.endUpdate();

            this.setState({ transactionCount: this._existingIds.length });
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
            } else if (node.data.feedItem.metaData?.MS) {
                color = Visualizer.COLOR_MILESTONE;
            } else if (node.data.confirmed) {
                color = node.data.feedItem?.value !== 0 && node.data.feedItem?.value !== undefined
                    ? Visualizer.COLOR_VALUE_CONFIRMED
                    : Visualizer.COLOR_ZERO_CONFIRMED;
            } else {
                color = Visualizer.COLOR_PENDING;
            }

            size = node.data.feedItem.metaData?.MS ||
                (node.data.feedItem?.value !== 0 && node.data.feedItem?.value !== undefined)
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
        const isDeselect = !node || this.state.selectedFeedItem?.id === node.id;
        this.setState({
            selectedFeedItem: isDeselect || !node
                ? undefined
                : node.data.feedItem
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

        if (data.feedItem) {
            for (const key in data.feedItem.metaData) {
                if (regEx.test(data.feedItem.metaData[key] as string)) {
                    return true;
                }
            }
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

    private highlightMilestones(): void {
        if (this._graph) {
            const highlightRegEx = this.highlightNodesRegEx();

            const toRemove: number[] = [];
            const now = Date.now();

            const keys: number[] = Object.keys(this._msIndexToNode).map(s => Number(s));
            for (let i = 0; i < keys.length; i++) {
                const msIndex = keys[i];
                const node = this._graph.getNode(this._msIndexToNode[msIndex].id);
                if (node?.data.feedItem) {
                    this._msIndexToNode[msIndex].lastSeen = now;
                    node.data.feedItem.metaData = node.data.feedItem.metaData ?? {};
                    node.data.feedItem.metaData.MS = msIndex;
                    this.styleNode(node, this.testForHighlight(highlightRegEx, node.id, node.data));
                } else if (now - this._msIndexToNode[msIndex].lastSeen > 300000) {
                    toRemove.push(msIndex);
                }
            }

            for (const rem of toRemove) {
                delete this._msIndexToNode[rem];
            }
        }
    }
}

export default Visualizer;
