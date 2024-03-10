import { useEffect, useRef, useState } from "react";
import { ServiceFactory } from "~factories/serviceFactory";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import Viva from "vivagraphjs";
import { INodeData } from "~models/graph/stardust/INodeData";
import { NovaFeedClient } from "~services/nova/novaFeedClient";
import { buildNodeShader } from "~helpers/nodeShader";

export const useFeed = (network: string) => {
    const [feedService] = useState<NovaFeedClient | null>(ServiceFactory.get<NovaFeedClient>(`feed-${network}`));

    const graphElement = useRef<HTMLDivElement | null>(null);
    const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    const resetCounter = useRef<number>(0);
    const lastUpdateTime = useRef<number>(0);
    const existingIds = useRef<string[]>([]);
    const graphics = useRef<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>(null);
    const renderer = useRef<Viva.Graph.View.IRenderer | null>(null);

    const [itemCount, setItemCount] = useState<number>(0);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            if (!feedService) {
                return;
            }
            setupGraph();
            feedSubscriptionStart();
        })();
    }, [feedService, graph.current, graphElement.current]);

    const onNewBlock = (newBlock: IFeedBlockData) => {
        if (graph.current) {
            const now = Date.now();
            lastUpdateTime.current = now;

            const blockId = newBlock.blockId;
            const existingNode = graph.current.getNode(blockId);

            if (!existingNode) {
                graph.current.addNode(blockId, {
                    feedItem: newBlock,
                    added: now,
                });

                existingIds.current.push(blockId);

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const parents = newBlock.block?.body?.strongParents?.length
                    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      newBlock.block?.body?.strongParents
                    : [];
                if (parents) {
                    const addedParents: string[] = [];
                    for (let i = 0; i < parents; i++) {
                        const parentId = parents[i];
                        if (!addedParents.includes(parentId)) {
                            addedParents.push(parentId);
                            if (!graph.current.getNode(parentId)) {
                                // graph.current.addNode(parentId);
                                existingIds.current.push(parentId);
                            }

                            // graph.current.addLink(parentId, blockId);
                        }
                    }
                }

                setItemCount(existingIds.current.length);
            }
        }
    };

    const feedSubscriptionStart = () => {
        if (!feedService) {
            return;
        }

        feedService.subscribeBlocks(
            onNewBlock,
            () => {},
            () => {},
        );
    };

    function setupGraph(): void {
        if (graphElement.current && !graph.current) {
            graph.current = Viva.Graph.graph<INodeData, unknown>();
            graphics.current = Viva.Graph.View.webglGraphics<INodeData, unknown>();

            const layout = Viva.Graph.Layout.forceDirected(graph.current, {
                springLength: 10,
                springCoeff: 0.0001,
                stableThreshold: 0.15,
                gravity: -2,
                dragCoeff: 0.02,
                timeStep: 20,
                theta: 0.8,
            });

            graphics.current.setNodeProgram(buildNodeShader());

            const events = Viva.Graph.webglInputEvents(graphics.current, graph.current);

            events.dblClick((node) => {
                window.open(`${window.location.origin}/${network}/block/${node.id}`, "_blank");
            });

            renderer.current = Viva.Graph.View.renderer<INodeData, unknown>(graph.current, {
                container: graphElement.current,
                graphics: graphics.current,
                layout,
                renderLinks: true,
            });

            renderer.current.run();

            graphics.current.scale(1, { x: graphElement.current.clientWidth / 2, y: graphElement.current.clientHeight / 2 });

            for (let i = 0; i < 12; i++) {
                renderer.current.zoomOut();
            }
        }
    }

    return {
        graphElement,
        resetCounter,
        itemCount,
    };
};
