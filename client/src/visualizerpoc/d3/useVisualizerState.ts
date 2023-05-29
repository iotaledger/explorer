import { useContext, useEffect, useRef, useState } from "react";
import NetworkContext from "../../app/context/NetworkContext";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../models/api/stardust/feed/IFeedBlockMetadata";
import { SettingsService } from "../../services/settingsService";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";

export interface GraphNode {
  id: string;
  data?: IFeedBlockData;
  msIndex?: number;
  timestamp?: number;
  x?: number;
  fx?: number;
  y?: number;
  fy?: number;
  vx?: number;
  vy?: number;
}
export interface GraphLink {
  source: string;
  target: string;
}
interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
const MAX_ITEMS: number = 2500;
const FEED_PROBE_THRESHOLD: number = 3000;


/**
 * Setup the Visualizer state and ok into feed service for visalizer data.
 * @param startAttack start attack example
 * @returns graph data
 */
export default function useVisualizerState(startAttack?: boolean): GraphData {
  const { name: network } = useContext(NetworkContext);
  const resetCounter = useRef<number>(0);
  const lastUpdateTime = useRef<number>(0);
  const feedProbe = useRef<NodeJS.Timer | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    feedProbe.current = setInterval(() => {
        if (!lastUpdateTime.current) {
            lastUpdateTime.current = Date.now();
        }
        const msSinceLast = Date.now() - lastUpdateTime.current;

        if (msSinceLast > FEED_PROBE_THRESHOLD) {
            resetCounter.current += 1;
        }
    }, FEED_PROBE_THRESHOLD);

    return () => {
        if (feedProbe.current) {
            clearInterval(feedProbe.current);
        }
        feedProbe.current = null;
        lastUpdateTime.current = 0;
    };
  }, [feedProbe]);

  useEffect(() => {
    if (startAttack) {
      setGraphData(prevGraphData => {
        const lastNode: GraphNode = prevGraphData.nodes[graphData.nodes.length - 1];
        const newNodes = [...prevGraphData.nodes];
        const newLinks = [...prevGraphData.links];
        const newNode: GraphNode = {
          id: "qzR5jsvALg9w0SbNd2CvYnEkI7JX8HgZloWT6fM4Ut3maKOVhrPeiDyFpxuBc1QG",
          timestamp: Date.now() / 100
        };
        newNode.timestamp = Date.now() / 100;
        if (lastNode.x && lastNode.y) {
          newNode.fx = lastNode.x;
          newNode.fy = lastNode.y * -3;
          newNode.vy = 1000;
        }
        newNodes.push(newNode);
        newLinks.push({ source: lastNode.id, target: newNode.id });

        return { nodes: newNodes, links: newLinks };
      });
    }
  }, [startAttack]);

  useEffect(() => {
    const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);
    console.log("reseting", resetCounter.current)
    if (feedService) {
      const onNewBlockData = (newBlock: IFeedBlockData) => {
        // console.log("newBlock", newBlock)
        lastUpdateTime.current = Date.now();
        setGraphData(prevGraphData => {
          const blockId = newBlock.blockId;
          const existingNode = prevGraphData.nodes.find(node => node.id === blockId);
          const newNodes = [...prevGraphData.nodes];
          const newLinks = [...prevGraphData.links];

          if (!existingNode) {
              // console.log("before", prevGraphData)
              const firstNode = prevGraphData?.nodes[0];
              const minTimestamp = firstNode ? firstNode.timestamp : false;
              const newNode: GraphNode = { id: blockId, data: newBlock };
              newNode.timestamp = Date.now() / 100;
              newNode.x = minTimestamp ? newNode.timestamp - minTimestamp : 0;
              newNode.fx = minTimestamp ? newNode.timestamp - minTimestamp : 0;
              const y = Math.random() * 100;
              newNode.y = y;
              newNode.fy = y;
              newNodes.push(newNode);

              if (newBlock.parents) {
                  for (let i = 0; i < newBlock.parents.length; i++) {
                      const parentId = newBlock.parents[i];

                      if (!newNodes.find(node => node.id === parentId)) {
                          const parentNode: GraphNode = { id: parentId };
                          parentNode.timestamp = Date.now() / 100;
                          parentNode.x = minTimestamp ? newNode.timestamp - minTimestamp : 0;
                          parentNode.fx = minTimestamp ? newNode.timestamp - minTimestamp : 0;
                          const parentY = Math.random() * 100;
                          parentNode.y = parentY;
                          parentNode.fy = parentY;
                          newNodes.push(parentNode);
                      }

                      newLinks.push({ source: parentId, target: blockId });
                  }
              }
          }

          return { nodes: newNodes, links: newLinks };
        });
      };

      const onMetaDataUpdated = (updatedMetadata: { [id: string]: IFeedBlockMetadata }) => {
        lastUpdateTime.current = Date.now();
        // console.log("updatedMetadata", updatedMetadata)
            setGraphData(prevGraphData => {
              const updatedNodes = prevGraphData.nodes.map(node => {
                if (node.data && updatedMetadata[node.id]) {
                  node.data.metadata = {
                    ...node.data.metadata,
                    ...updatedMetadata[node.id]
                  };
                }
                return node;
              });

              return { nodes: updatedNodes, links: prevGraphData.links };
          });
      };

      feedService.subscribeBlocks(onNewBlockData, onMetaDataUpdated);
    }
    return () => {
        console.log("unsubscribe")
        // eslint-disable-next-line no-void
        void feedService?.unsubscribeBlocks();
    };
  }, []);

  return graphData;
}
