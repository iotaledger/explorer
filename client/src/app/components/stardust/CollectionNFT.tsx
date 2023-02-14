import React, { ReactNode } from "react";
import Viva from "vivagraphjs";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import mainHeader from "../../../assets/modals/visualizer/main-header.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import {
    CollRestriction,
    INFTCollectionMember,
    useNFTCollection
} from "../../../helpers/stardust/hooks/useNFTCollection";
import { INftBase } from "../../../helpers/stardust/nftHelper";
import { SettingsService } from "../../../services/settingsService";
import NetworkContext from "../../context/NetworkContext";
import Modal from "../Modal";
import Nft from "./Nft";

interface CollectionNFTProps {
    network: string;
    collectionNFT: INftBase;
}

const CollectionNFT: React.FC<CollectionNFTProps> = (
    { network, collectionNFT }
) => {
    const nftCollection = useNFTCollection(network, collectionNFT, CollRestriction.ONLY_SAME_ISSUER);
    console.log(nftCollection);
    return (
        <div className="section nft--section">
            {nftCollection && <Visualizer network={network} collectionNFT={nftCollection} />}
        </div>
    );
};

export default CollectionNFT;

export interface VisProps {
    collectionNFT: INFTCollectionMember;
    network: string;
}

export interface VisState {
    itemCount: number;
    selectedFeedItem?: INFTCollectionMember;
    filter: string;
}

class Visualizer extends React.Component<VisProps, VisState> {
    protected _settingsService: SettingsService;

    /**
     * Edge colour default.
     */
    private static readonly EDGE_COLOR_LIGHT: number = 0x00000085;

    /**
     * Edge colour default.
     */
    private static readonly EDGE_COLOR_DARK: number = 0xFFFFFF33;

    /**
     * Vertex pending zero colour.
     */
    private static readonly COLOR_PENDING: string = "0xbbbbbb";

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * The graph instance.
     */
    private _graph?: Viva.Graph.IGraph<INFTCollectionMember, unknown>;

    /**
     * The renderer instance.
     */
    private _renderer?: Viva.Graph.View.IRenderer;

    /**
     * The graphics instance.
     */
    private _graphics?: Viva.Graph.View.IWebGLGraphics<INFTCollectionMember, unknown>;

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
    private readonly _hadInitialLoad: boolean;

    /**
     * Dark mode from service settings.
     */
    private _darkMode: boolean | undefined;

    /**
     * Create a new instance of Visualizer.
     * @param props The props.
     */
    constructor(props: VisProps) {
        super(props);

        this._existingIds = [];
        this._removeNodes = [];
        this._hadInitialLoad = false;
        this._settingsService = ServiceFactory.get<SettingsService>("settings");
        this._darkMode = this._settingsService.get().darkMode;

        this._graphElement = null;
        this._resize = () => this.resize();

        this.state = {
            itemCount: 0,
            selectedFeedItem: undefined,
            filter: ""
        };
    }

    public async componentDidMount(): Promise<void> {
        window.addEventListener("resize", this._resize);
        console.log("componentDidMount", this.props.collectionNFT);
        this.renderGraph(this.props.collectionNFT);
    }

    public componentWillUnmount(): void {
        this._graphElement = null;
        window.removeEventListener("resize", this._resize);
    }

    public render(): ReactNode {
        const { itemCount, selectedFeedItem, filter } = this.state;

        if (this._darkMode !== this._settingsService.get().darkMode) {
            this._darkMode = this._settingsService.get().darkMode;
            this.styleConnections();
        }
        return (
            <div className="visualizer-stardust">
                <div className="row middle">
                    <div className="row middle heading margin-r-t margin-b-t">
                        <h1>{this.props.collectionNFT.metadata?.collectionName}</h1>
                        <Modal icon="info" data={mainHeader} />
                    </div>
                </div>
                <div className="graph-border">
                    <div className="viva" ref={r => this.setupGraph(r)} />
                </div>
                <div className="stats-panel-container">
                    <div className="card stats-panel">
                        <div className="card--content">
                            <div className="card--label">NFTs</div>
                            <div className="card--value">{itemCount}</div>
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
                            <div className="card--content">
                                <div className="card--label">NFT</div>
                                <div className="card--value overflow-ellipsis">
                                    <Nft
                                        id={selectedFeedItem.id}
                                        network={this.props.network}
                                        metadata={selectedFeedItem.metadata}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        );
    }

    protected renderGraph(nftCollection: INFTCollectionMember): void {
        if (!this._graph) {
            return;
        }

        this.addNode(nftCollection);
        this.setState({ itemCount: this._existingIds.length });
    }

    protected addNode(member: INFTCollectionMember): void {
        if (!this._graph) {
            return;
        }
        const id = member.id;

        this._graph.addNode(id, member);
        this._existingIds.push(id);

        if (parent && member.children.length > 0) {
            for (const child of member.children) {
                this.addNode(child);
                this._graph.addLink(id, child.id);
            }
        }
    }

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
     * Setup the graph.
     * @param graphElem The element to use.
     */
    private setupGraph(graphElem: HTMLElement | null): void {
        this._graphElement = graphElem;

        if (!graphElem || this._graph) {
            return;
        }

        this._graph = Viva.Graph.graph();

        this._graphics = Viva.Graph.View.webglGraphics();

        const layout = Viva.Graph.Layout.forceDirected(this._graph, {
            springLength: 20,
            springCoeff: 0.0001,
            stableThreshold: 0.15,
            gravity: -4,
            dragCoeff: 0.02,
            timeStep: 20,
            theta: 0.8
        });

        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this._graphics.setNodeProgram(Viva.Graph.View.webglImageNodeProgram(4096));

        this._graphics.node(node =>
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            Viva.Graph.View.webglImage(20, node.data?.metadata?.uri)
        );

        this._graphics.link(() => Viva.Graph.View.webglLine(this._darkMode
            ? Visualizer.EDGE_COLOR_DARK : Visualizer.EDGE_COLOR_LIGHT));

        const events = Viva.Graph.webglInputEvents(this._graphics, this._graph);
        events.click(node => this.selectNode(node));
        events.dblClick(node => {
            window.open("replace me with NFT link", "_blank");
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
            // @ts-expect-error
            this._renderer.zoomIn();
        }
    }

    private styleNode(node: Viva.Graph.INode<INFTCollectionMember, unknown> | undefined, highlight: boolean): void {
        if (!this._graphics || !node) {
            return;
        }

        const nodeUI = this._graphics.getNodeUI(node.id);
        if (nodeUI) {
            const { color, size } = this.calculateNodeStyle(node, highlight);
            nodeUI.color = color;
            nodeUI.size = size;
        }
    }

    private calculateNodeStyle(node: Viva.Graph.INode<INFTCollectionMember, unknown> | undefined, highlight: boolean): {
        color: string;
        size: number;
    } {
        const color = Visualizer.COLOR_PENDING;
        const size = 30;

        return { color, size };
    }

    private selectNode(node?: Viva.Graph.INode<INFTCollectionMember, unknown>): void {
        const isDeselect = !node || this.state.selectedFeedItem?.id === node.id;
        this.setState({
            selectedFeedItem: isDeselect || !node
                ? undefined
                : node.data
        });
    }

    private restyleNodes(): void {
        const regEx = this.highlightNodesRegEx();

        if (!this._graph) {
            return;
        }

        this._graph.forEachNode((node: Viva.Graph.INode<INFTCollectionMember, unknown>) => {
            this.styleNode(node, this.testForHighlight(regEx, node.id, node.data));
        });
    }

    private highlightNodesRegEx(): RegExp | undefined {
        const trimmedFilter = this.state.filter.trim();

        if (trimmedFilter.length > 0) {
            return new RegExp(trimmedFilter);
        }
    }

    private testForHighlight(
        regEx: RegExp | undefined,
        nodeId: string | undefined,
        data: INFTCollectionMember | undefined): boolean {
        if (!regEx || !nodeId || !data) {
            return false;
        }

        if (regEx.test(nodeId)) {
            return true;
        }

        if (data && regEx.test(data.id)) {
            return true;
        }

        return false;
    }

    private resize(): void {
        if (this._graphElement && this._graphics) {
            this._graphics.updateSize();
            this._graphics.scale(1, {
                x: this._graphElement.clientWidth / 2,
                y: this._graphElement.clientHeight / 2
            });
        }
    }
}
