/* eslint-disable react/jsx-no-useless-fragment */
import { IWsVertex, WsMsgType, WsVertexParentType } from "@iota/protonet.js";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Viva from "vivagraphjs";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { buildNodeShader } from "../../../helpers/nodeShader";
import { RouteBuilder } from "../../../helpers/routeBuilder";
import { INetwork } from "../../../models/config/INetwork";
import { SettingsService } from "../../../services/settingsService";
import AsyncComponent from "../../components/AsyncComponent";
import NetworkContext from "../../context/NetworkContext";
import mainHeader from "./../../../assets/modals/visualizer/main-header.json";
import Modal from "./../../components/Modal";
import "./Visualizer.scss";

const apiEndpoint = (window as any).env.API_ENDPOINT as string;

interface VisualizerProps {
    network: string;
}

interface VisualizerState {
    itemCount: number;
    itemsPerSecond: string;
    selectedFeedItem?: IWsVertex;
    filter: string;
    isActive: boolean;
    isFormatAmountsFull?: boolean;
}

/**
 * Component which will show the visualizer page.
 */
class Visualizer extends AsyncComponent<RouteComponentProps<VisualizerProps>, VisualizerState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    private static readonly MAX_ITEMS: number = 5000;

    private static readonly EDGE_COLOR_LIGHT: number = 0x00000055;

    private static readonly EDGE_COLOR_DARK: number = 0xFFFFFF33;

    private static readonly EDGE_COLOR_CONFIRMING: number = 0xFF5AAAFF;

    private static readonly EDGE_COLOR_CONFIRMED_BY: number = 0x0000FFFF;

    private static readonly COLOR_TX: string = "0xff33d4";

    private static readonly COLOR_PENDING: string = "0xbbbbbb";

    private static readonly COLOR_ACCEPTED: string = "0x4caaff";

    private static readonly COLOR_ORPHANED: string = "0xff8b5c";

    private static readonly COLOR_INVALID: string = "0xff5c5c";

    private static readonly COLOR_TX_ACCEPTED: string = "0x00BF94";

    private static readonly COLOR_TX_REJECTED: string = "0xa04cff";

    private static readonly COLOR_TX_CONFLICT: string = "0xffd95c";

    private static readonly COLOR_FINALIZED: string = "0x61e884";

    private static readonly COLOR_SEARCH_RESULT: string = "0xe79c18";

    public declare context: React.ContextType<typeof NetworkContext>;

    private _graph?: Viva.Graph.IGraph<IWsVertex, unknown>;

    private _renderer?: Viva.Graph.View.IRenderer;

    private _graphics?: Viva.Graph.View.IWebGLGraphics<IWsVertex, unknown>;

    // All the items being visualized.
    private readonly _existingIds: string[];

    // Nodes to remove.
    private readonly _removeNodes: string[];

    // The resize method
    private readonly _resize: () => void;

    // The graph element.
    private _graphElement: HTMLElement | null;

    // Skip the initial load.
    private _hadInitialLoad: boolean;

    // Dark mode from service settings.
    private _darkMode: boolean | undefined;

    private readonly _socket: Socket;

    private readonly _settingsService: SettingsService;

    private readonly _networkConfig: INetwork | undefined;

    constructor(props: RouteComponentProps<VisualizerProps>) {
        super(props);

        this._existingIds = [];
        this._removeNodes = [];
        this._hadInitialLoad = false;
        this._settingsService = ServiceFactory.get<SettingsService>("settings");
        this._darkMode = this._settingsService.get().darkMode;

        this._graphElement = null;
        this._resize = () => this.resize();

        this.state = {
            itemsPerSecond: "--",
            itemCount: 0,
            selectedFeedItem: undefined,
            filter: "",
            isActive: true
        };

        this._socket = io(apiEndpoint, { upgrade: true, transports: ["websocket"] });
        this.connectFeed();
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        window.addEventListener("resize", this._resize);
        window.scrollTo({
            left: 0,
            top: 0,
            behavior: "smooth"
        });
    }

    public componentWillUnmount(): void {
        super.componentWillUnmount();
        this._graphElement = null;
        window.removeEventListener("resize", this._resize);
        if (this._socket) {
            this._socket?.close();
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            itemCount, selectedFeedItem, filter, isActive, itemsPerSecond
        } = this.state;

        if (this._darkMode !== this._settingsService.get().darkMode) {
            this._darkMode = this._settingsService.get().darkMode;
            this.styleConnections();
        }
        return (
            <div className="visualizer-protonet">
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
                            <div className="card--label">Blocks</div>
                            <div className="card--value">
                                {itemCount}
                            </div>
                            <div className="card--label">BPS</div>
                            <div className="card--value">
                                {itemsPerSecond}
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
                                                href={`/${this.props.match.params.network}` +
                                                    `/block/${selectedFeedItem.id}`}
                                            >
                                                {selectedFeedItem.id}
                                            </a>
                                        </div>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="key-panel-container">
                    <div className="card key-panel margin-r-5">
                        <div className="key-panel-item">
                            <div className="key-label">Block</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--pending" />
                            <div className="key-label">Pending</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--accepted" />
                            <div className="key-label">Accepted</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--finalized" />
                            <div className="key-label">Finalized</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--orphaned" />
                            <div className="key-label">Orphaned</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--invalid" />
                            <div className="key-label">Invalid</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--search-result" />
                            <div className="key-label">Search result</div>
                        </div>
                    </div>
                    <div className="card key-panel">
                        <div className="key-panel-item">
                            <div className="key-label">Tx</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--tx-pending" />
                            <div className="key-label">Pending</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--tx-accepted" />
                            <div className="key-label">Accepted</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--tx-conflict" />
                            <div className="key-label">Conflict</div>
                        </div>
                        <div className="key-panel-item">
                            <div className="key-marker vertex-state--tx-rejected" />
                            <div className="key-label">Rejected</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    protected connectFeed(): void {
        this._socket?.emit(`proto-${WsMsgType.Vertex}`);
        this._socket?.on(WsMsgType.Vertex.toString(), async (data: IWsVertex) => {
            this.handleVertex(data);
        });
    }

    protected handleVertex(item: IWsVertex): void {
        if (!this._graph) {
            return;
        }

        if (!this._hadInitialLoad) {
            this._hadInitialLoad = true;
            return;
        }

        const existingNode = this._graph.getNode(item.id);
        if (!existingNode) {
            console.log("adding node with id", item.id);
            this._graph.addNode(item.id, item);
            this._existingIds.push(item.id);

            if (item.parentIDsByType) {
                this.drawEdges(item);
            }

            this.checkLimit();
            this.setState({ itemCount: this._existingIds.length });
            return;
        }

        this.metadataUpdated(item);
        this.drawEdges(item);
    }

    protected drawEdges(item: IWsVertex) {
        if (!this._graph) {
            return;
        }

        const addedParents: string[] = [];
        const strongParents = item.parentIDsByType[WsVertexParentType.Strong];
        for (let i = 0; i < strongParents.length; i++) {
            const parentId = strongParents[i];
            if (!addedParents.includes(parentId)) {
                addedParents.push(parentId);
                if (!this._graph.getNode(parentId)) {
                    console.log("parent", parentId, "not found for", item.id);
                    this._graph.addNode(parentId);
                    this._existingIds.push(parentId);
                }

                this._graph.addLink(parentId, item.id);
            }
        }
    }

    /**
     * The confirmed items have been updated.
     * @param item The vertex.
     */
    protected metadataUpdated(item: IWsVertex): void {
        if (!this._graph || !this._hadInitialLoad) {
            return;
        }

        const highlightRegEx = this.highlightNodesRegEx();
        const node = this._graph.getNode(item.id);
        if (!node) {
            return;
        }

        if (node.data) {
            // node.data.isAccepted = node.data?.isAccepted || item.isAccepted;
            node.data.is_finalized = node.data?.is_finalized || item.is_finalized;
            // node.data.isOrphaned = node.data?.isOrphaned || item.isOrphaned;
            // node.data.isBooked = node.data?.isBooked || item.isBooked;
            // node.data.isMissing = node.data?.isMissing || item.isMissing;
            node.data.is_tx = node.data?.is_tx || item.is_tx;
            // node.data.isTxAccepted = node.data?.isTxAccepted || item.isTxAccepted;
            // node.data.isTxRejected = node.data?.isTxRejected || item.isTxRejected;
            // node.data.isTxConflicting = node.data?.isTxConflicting || item.isTxConflicting;
        }
        this.styleNode(node, this.testForHighlight(highlightRegEx, node.id, node.data));
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
    private styleNode(node: Viva.Graph.INode<IWsVertex, unknown> | undefined, highlight: boolean): void {
        if (this._graphics && node) {
            const nodeUI = this._graphics.getNodeUI(node.id);
            if (!nodeUI) {
                return;
            }

            const { color, size } = this.calculateNodeStyle(node, highlight);
            nodeUI.color = color;
            nodeUI.size = size;
        }
    }

    /**
     * Style the node.
     * @param node The node to style.
     * @param highlight Highlight the node.
     * @returns The size and color for the node.
     */
    private calculateNodeStyle(node: Viva.Graph.INode<IWsVertex, unknown> | undefined, highlight: boolean): {
        color: string;
        size: number;
    } {
        let color = Visualizer.COLOR_PENDING;
        let size = 10;

        if (!node?.data) {
            return { color, size };
        }

        size = 20;

        if (highlight) {
            color = Visualizer.COLOR_SEARCH_RESULT;
            return { color, size };
        }

        if (node.data.is_tx) {
            color = Visualizer.COLOR_TX;
            size = 45;

            // if (node.data.isAccepted) {
            //     color = Visualizer.COLOR_TX_ACCEPTED;
            // } else if (node.data.isTxRejected) {
            //     color = Visualizer.COLOR_TX_REJECTED;
            // } else if (node.data.isTxConflicting) {
            //     color = Visualizer.COLOR_TX_CONFLICT;
            // }

            return { color, size };
        }

        if (node.data.is_finalized) {
            color = Visualizer.COLOR_FINALIZED;
            // } else if (node.data.isOrphaned) {
            //     color = Visualizer.COLOR_ORPHANED;
            // } else if (node.data.isInvalid) {
            //     color = Visualizer.COLOR_INVALID;
            // } else if (node.data.isAccepted) {
            //     color = Visualizer.COLOR_ACCEPTED;
        } else {
            color = Visualizer.COLOR_PENDING;
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
    private selectNode(node?: Viva.Graph.INode<IWsVertex, unknown>): void {
        const isDeselect = !node || this.state.selectedFeedItem?.id === node.id;
        this.setState({
            selectedFeedItem: isDeselect || !node
                ? undefined
                : node.data
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
            this._graph.forEachNode((node: Viva.Graph.INode<IWsVertex, unknown>) => {
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
        data: IWsVertex | undefined): boolean {
        /*
        if (!regEx || !nodeId || !data) {
            return false;
        }

        if (regEx.test(nodeId)) {
            return true;
        }

        if (data) {
            for (const key in data) {
                const val = data.properties[key] as string;
                if (typeof val === "string" && Converter.isHex(val, true) && regEx.test(Converter.hexToUtf8(val))) {
                    return true;
                }
            }
        }

        return false;
         */
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
        if (!this._graph) {
            return;
        }

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

export default Visualizer;

