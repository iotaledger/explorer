/* eslint-disable react/jsx-no-useless-fragment */
import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { Converter, HexHelper } from "@iota/util.js-stardust";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import Viva from "vivagraphjs";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import { buildNodeShader } from "../../../helpers/nodeShader";
import { RouteBuilder } from "../../../helpers/routeBuilder";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { IFeedItem } from "../../../models/feed/IFeedItem";
import { IFeedItemMetadata } from "../../../models/feed/IFeedItemMetadata";
import { INodeData } from "../../../models/graph/INodeData";
import Feeds from "../../components/stardust/Feeds";
import NetworkContext from "../../context/NetworkContext";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import { VisualizerState } from "../VisualizerState";
import mainHeader from "./../../../assets/modals/visualizer/main-header.json";
import Modal from "./../../components/Modal";
import "./Visualizer.scss";

/**
 * Component which will show the visualizer page.
 */
class Visualizer extends Feeds<RouteComponentProps<VisualizerRouteProps>, VisualizerState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * Maximum number of items.
     */
    private static readonly MAX_ITEMS: number = 5000;

    /**
     * Edge colour default.
     */
    private static readonly EDGE_COLOR_LIGHT: number = 0x00000055;

    /**
     * Edge colour default.
     */
    private static readonly EDGE_COLOR_DARK: number = 0xFFFFFF33;

    /**
     * Edge color confirming.
     */
    private static readonly EDGE_COLOR_CONFIRMING: number = 0xFF5AAAFF;

    /**
     * Edge color confirmed by.
     */
    private static readonly EDGE_COLOR_CONFIRMED_BY: number = 0x0000FFFF;

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
     * Vertex referenced colour.
     */
    private static readonly COLOR_REFERENCED: string = "0x61e884";

    /**
     * Vertex conflicting colour.
     */
    private static readonly COLOR_CONFLICTING: string = "0xff8b5c";

    /**
     * Vertex included colour.
     */
    private static readonly COLOR_INCLUDED: string = "0x4caaff";

    /**
     * Vertex milestone colour.
     */
    private static readonly COLOR_MILESTONE: string = "0x666af6";

    /**
     * Vertex highlighted colour.
     */
    private static readonly COLOR_SEARCH_RESULT: string = "0xe79c18";

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

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
     * All the items being visualized.
     */
    private readonly _existingIds: string[];

    /**
     * Nodes to remove.
     */
    private readonly _removeNodes: string[];

    /**
     * The resize method
     */
    private readonly _resize: () => void;

    /**
     * The graph element.
     */
    private _graphElement: HTMLElement | null;

    /**
     * Skip the initial load.
     */
    private _hadInitialLoad: boolean;

    /**
     * Dark mode from service settings.
     */
    private _darkMode: boolean | undefined;

    /**
     * Create a new instance of Visualizer.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<VisualizerRouteProps>) {
        super(props);

        this._existingIds = [];
        this._removeNodes = [];
        this._hadInitialLoad = false;
        this._darkMode = this._settingsService.get().darkMode;

        this._graphElement = null;
        this._resize = () => this.resize();

        this.state = {
            itemsPerSecond: "--",
            confirmedItemsPerSecond: "--",
            confirmedItemsPerSecondPercent: "--",
            itemsPerSecondHistory: [],
            milestones: [],
            currency: "USD",
            itemCount: 0,
            selectedFeedItem: undefined,
            filter: "",
            isActive: true
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        await super.componentDidMount();

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
        this._graphElement = null;
        window.removeEventListener("resize", this._resize);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            itemCount, selectedFeedItem, filter, isActive, isFormatAmountsFull,
            itemsPerSecond, confirmedItemsPerSecond, confirmedItemsPerSecondPercent
        } = this.state;
        const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;

        if (this._darkMode !== this._settingsService.get().darkMode) {
            this._darkMode = this._settingsService.get().darkMode;
            this.styleConnections();
        }
        return (
            <div className="visualizer-stardust">
                <div className="row middle">
                    <div className="row middle heading margin-r-t margin-b-t">
                        <h1>Visualizer</h1>
                        <Modal icon="info" data={mainHeader} />
                    </div>
                    <div className="card search-filter fill">
                        <div className="card--content row middle">
                            <div className="card--label margin-r-s">Search</div>
                            <input
                                className="input form-input-long"
                                type="text"
                                value={filter}
                                onChange={e => this.setState({ filter: e.target.value }, () => this.restyleNodes())}
                                maxLength={2000}
                            />
                        </div>
                    </div>
                </div>
                <div className="graph-border">
                    <div
                        className="viva"
                        ref={r => this.setupGraph(r)}
                    />
                    <div className="action-panel-container">
                        <div className="card">
                            <button className="pause-button" type="button" onClick={() => this.toggleActivity()}>
                                {isActive
                                    ? <span className="material-icons">pause</span>
                                    : <span className="material-icons">play_arrow</span>}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="stats-panel-container">
                    <div className="card stats-panel">
                        <div className="card--content">
                            <div className="stats-panel__info">
                                <div className="card--label">Blocks</div>
                                <div className="card--value">
                                    {itemCount}
                                </div>
                            </div>
                            <div className="stats-panel__info">
                                <div className="card--label">BPS / CBPS</div>
                                <div className="card--value">
                                    {itemsPerSecond} / {confirmedItemsPerSecond}
                                </div>
                            </div>
                            <div className="stats-panel__info">
                                <div className="card--label">Referenced Rate</div>
                                <div className="card--value">
                                    {confirmedItemsPerSecondPercent}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {selectedFeedItem && (
                    <div className="info-panel-container">
                        <div className="card fill padding-m">
                            <div className="row middle spread">
                                <button type="button" className="icon-button" onClick={() => this.selectNode()}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="col">
                                <div className="card--content">
                                    <>
                                        <div className="card--label">Block</div>
                                        <div className="card--value overflow-ellipsis">
                                            <a
                                                className="button"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={
                                                    `${window.location.origin}${RouteBuilder.buildItem(
                                                        this._networkConfig, selectedFeedItem.id)}`
                                                }
                                            >
                                                {selectedFeedItem.id}
                                            </a>
                                        </div>
                                        {selectedFeedItem?.properties?.Tag &&
                                                selectedFeedItem.metaData?.milestone === undefined && (
                                                    <React.Fragment>
                                                        <div className="card--label">Tag</div>
                                                        <div className="card--value overflow-ellipsis">
                                                            <a
                                                                className="button"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {selectedFeedItem?.properties.Tag as string}
                                                            </a>
                                                        </div>
                                                    </React.Fragment>
                                                )}
                                        {selectedFeedItem?.properties?.Index && (
                                            <React.Fragment>
                                                <div className="card--label">Tag</div>
                                                <div className="card--value overflow-ellipsis">
                                                    <a className="button" target="_blank" rel="noopener noreferrer">
                                                        {Converter.hexToUtf8(
                                                            selectedFeedItem?.properties.Index as string
                                                        )}
                                                    </a>
                                                </div>
                                                <div className="card--label">
                                                    Index Hex
                                                </div>
                                                <div className="card--value overflow-ellipsis">
                                                    <a className="button" target="_blank" rel="noopener noreferrer">
                                                        {selectedFeedItem?.properties.Index as string}
                                                    </a>
                                                </div>
                                            </React.Fragment>
                                        )}
                                        {selectedFeedItem.metaData?.milestone !== undefined && (
                                            <React.Fragment>
                                                <div className="card--label">
                                                    Milestone
                                                </div>
                                                <div className="card--value">
                                                    {selectedFeedItem.metaData.milestone}
                                                </div>
                                            </React.Fragment>
                                        )}
                                        {selectedFeedItem?.value !== undefined &&
                                                selectedFeedItem.metaData?.milestone === undefined && (
                                                    <React.Fragment>
                                                        <div className="card--label">Value</div>
                                                        <div className="card--value">
                                                            <span
                                                                onClick={() => this.setState({
                                                                    isFormatAmountsFull: !isFormatAmountsFull
                                                                })}
                                                                className="pointer margin-r-5"
                                                            >
                                                                {
                                                                    formatAmount(
                                                                        selectedFeedItem?.value,
                                                                        tokenInfo,
                                                                        isFormatAmountsFull
                                                                    )
                                                                }
                                                            </span>
                                                        </div>
                                                    </React.Fragment>
                                                )}
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="key-panel-container">
                    <div className="card key-panel">
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--pending" />
                            <div className="key-label">Pending</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--included" />
                            <div className="key-label">Included</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--referenced" />
                            <div className="key-label">Referenced</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--conflicting" />
                            <div className="key-label">Conflicting</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--milestone" />
                            <div className="key-label">Milestone</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--search-result" />
                            <div className="key-label">Search result</div>
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
        if (this._graph) {
            if (this._hadInitialLoad) {
                const now = Date.now();

                for (const item of newItems) {
                    const id = HexHelper.stripPrefix(item.id);
                    const existingNode = this._graph.getNode(id);

                    if (!existingNode) {
                        this._graph.addNode(id, {
                            feedItem: item,
                            added: now
                        });
                        this._existingIds.push(id);

                        if (item.parents) {
                            const addedParents: string[] = [];
                            for (let i = 0; i < item.parents.length; i++) {
                                const parentId = HexHelper.stripPrefix(item.parents[i]);
                                if (!addedParents.includes(parentId)) {
                                    addedParents.push(parentId);
                                    if (!this._graph.getNode(parentId)) {
                                        this._graph.addNode(parentId);
                                        this._existingIds.push(parentId);
                                    }

                                    this._graph.addLink(parentId, id);
                                }
                            }
                        }
                    }
                }

                this.checkLimit();

                this.setState({ itemCount: this._existingIds.length });
            } else {
                this._hadInitialLoad = true;
            }
        }
    }

    /**
     * The confirmed items have been updated.
     * @param metaData The updated confirmed items.
     */
    protected metadataUpdated(metaData: { [id: string]: IFeedItemMetadata }): void {
        if (this._graph && this._hadInitialLoad) {
            const highlightRegEx = this.highlightNodesRegEx();

            for (const id in metaData) {
                const noPrefixId = HexHelper.stripPrefix(id);
                const node = this._graph.getNode(noPrefixId);
                if (node) {
                    if (node.data) {
                        node.data.feedItem.metaData = {
                            ...node.data.feedItem.metaData,
                            ...metaData[id]
                        };
                    }
                    this.styleNode(node, this.testForHighlight(highlightRegEx, node.id, node.data));
                }
            }
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

            this._graphics.setNodeProgram(buildNodeShader());

            this._graphics.node(node => this.calculateNodeStyle(
                node, this.testForHighlight(this.highlightNodesRegEx(), node.id, node.data)));

            this._graphics.link(() => Viva.Graph.View.webglLine(this._darkMode
                ? Visualizer.EDGE_COLOR_DARK : Visualizer.EDGE_COLOR_LIGHT));

            const events = Viva.Graph.webglInputEvents(this._graphics, this._graph);
            events.click(node => this.selectNode(node));
            events.dblClick(node => {
                window.open(`${window.location.origin}${RouteBuilder.buildItem(
                    this._networkConfig, node.id)}`, "_blank");
            });

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
        }
    }

    /**
     * Check the limit of items.
     */
    private checkLimit(): void {
        if (this._graph && this._renderer) {
            // remove any nodes over the max limit, earliest in the list
            // are the oldest
            while (this._existingIds.length > Visualizer.MAX_ITEMS) {
                const nodeToRemove = this._existingIds.shift();
                if (nodeToRemove) {
                    this._removeNodes.push(nodeToRemove);
                }
            }
            this.removeNodes();

            this.setState({ itemCount: this._existingIds.length });
        }
    }

    /**
     * Style the node.
     * @param node The node to style.
     * @param highlight Highlight the node.
     */
    private styleNode(node: Viva.Graph.INode<INodeData, unknown> | undefined, highlight: boolean): void {
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
    private calculateNodeStyle(node: Viva.Graph.INode<INodeData, unknown> | undefined, highlight: boolean): {
        color: string;
        size: number;
    } {
        let color = Visualizer.COLOR_PENDING;
        let size = 10;

        if (node?.data) {
            size = 20;
            if (highlight) {
                color = Visualizer.COLOR_SEARCH_RESULT;
            } else if (node.data.feedItem.metaData?.milestone) {
                color = Visualizer.COLOR_MILESTONE;
                size = 30;
            } else if (node.data.feedItem.metaData?.conflicting) {
                color = Visualizer.COLOR_CONFLICTING;
            } else if (node.data.feedItem.metaData?.confirmed) {
                if (node.data.feedItem?.value !== 0 && node.data.feedItem?.value !== undefined) {
                    color = Visualizer.COLOR_VALUE_CONFIRMED;
                    size = 30;
                } else {
                    color = Visualizer.COLOR_ZERO_CONFIRMED;
                }
            } else if (node.data.feedItem.metaData?.included) {
                color = Visualizer.COLOR_INCLUDED;
                size = 30;
            } else if (node.data.feedItem.metaData?.referenced) {
                color = Visualizer.COLOR_REFERENCED;
            } else {
                color = Visualizer.COLOR_PENDING;
            }
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
    private selectNode(node?: Viva.Graph.INode<INodeData, unknown>): void {
        const isDeselect = !node || this.state.selectedFeedItem?.id === node.id;
        this.setState({
            selectedFeedItem: isDeselect || !node
                ? undefined
                : node.data?.feedItem
        });

        this.styleConnections();

        if (!isDeselect && node) {
            this.highlightConnections(node.id);
        }
    }

    /**
     * Highlight the forward and backwards cones.
     * @param nodeId The node to highlight.
     */
    private highlightConnections(nodeId: string): void {
        if (this._graph) {
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
    }

    /**
     * Style the connections as default colors.
     */
    private styleConnections(): void {
        if (this._graph) {
            this._graph.forEachLink((link: Viva.Graph.ILink<unknown>) => {
                const linkUI = this._graphics?.getLinkUI(link.id);
                if (linkUI) {
                    linkUI.color = this._darkMode
                        ? Visualizer.EDGE_COLOR_DARK
                        : Visualizer.EDGE_COLOR_LIGHT;
                }
            });
        }
    }

    /**
     * Restyle all the nodes.
     */
    private restyleNodes(): void {
        const regEx = this.highlightNodesRegEx();

        if (this._graph) {
            this._graph.forEachNode((node: Viva.Graph.INode<INodeData, unknown>) => {
                this.styleNode(node, this.testForHighlight(regEx, node.id, node.data));
            });
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
            for (const key in data.feedItem.properties) {
                const val = data.feedItem.properties[key] as string;
                if (typeof val === "string" && Converter.isHex(val, true) && regEx.test(Converter.hexToUtf8(val))) {
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
        if (this._graphElement && this._graphics) {
            this._graphics.updateSize();
            this._graphics.scale(1, {
                x: this._graphElement.clientWidth / 2,
                y: this._graphElement.clientHeight / 2
            });
        }
    }

    /**
     * The pause button was clicked
     */
    private toggleActivity(): void {
        if (this._renderer) {
            if (this.state.isActive) {
                this._renderer.pause();
            } else {
                this._renderer.resume();
            }
        }

        this.setState({ isActive: !this.state.isActive });
    }

    /**
     * Remove the nodes from the queue.
     */
    private removeNodes(): void {
        if (this._graph) {
            while (this._removeNodes.length > 0) {
                const nodeToRemove = this._removeNodes.shift();
                if (nodeToRemove) {
                    this._graph.forEachLinkedNode(nodeToRemove, (linkedNode, link) => {
                        if (this._graph) {
                            this._graph.removeLink(link);

                            if (linkedNode.links.length === 0) {
                                this._graph.removeNode(linkedNode.id);
                            }
                        }
                    });

                    this._graph.removeNode(nodeToRemove);

                    if (this.state.selectedFeedItem?.id === nodeToRemove) {
                        this.setState({ selectedFeedItem: undefined });
                    }
                }
            }
        }
    }
}

export default Visualizer;

