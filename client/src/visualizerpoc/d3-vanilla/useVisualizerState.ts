import { dagStratify } from "d3-dag"; 
import { useContext, useEffect, useRef, useState } from "react";
import NetworkContext from "../../app/context/NetworkContext";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../models/api/stardust/feed/IFeedBlockMetadata";
import { SettingsService } from "../../services/settingsService";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";

export interface GraphNode {
  id: string;
  parentIds: string[];
  data?: IFeedBlockData;
}

// export interface DagNode {
//   id: string;
//   parentIds: string[];
//   data: GraphNode;
// }

const MAX_ITEMS: number = 2500;
const FEED_PROBE_THRESHOLD: number = 3000;


/**
 * Setup the Visualizer state and ok into feed service for visalizer data.
 * @returns graph data
 */
export default function useVisualizerState(): GraphNode[] {
  const { name: network } = useContext(NetworkContext);
  const resetCounter = useRef<number>(0);
  const lastUpdateTime = useRef<number>(0);
  const feedProbe = useRef<NodeJS.Timer | null>(null);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);

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
    const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);
    console.log("reseting", resetCounter.current);
    if (feedService) {
      const onNewBlockData = (newBlock: IFeedBlockData) => {
        // console.log("newBlock", newBlock)
        lastUpdateTime.current = Date.now();
        setGraphNodes(prevGraphNodesData => {
          const blockId = newBlock.blockId;
          const existingNode = prevGraphNodesData.find(node => node.id === blockId);
          const newGraphNodesData = [...prevGraphNodesData];

          if (!existingNode) {
              const newNode: GraphNode = { id: blockId, parentIds: newBlock.parents ?? [], data: newBlock };

              if (newNode.parentIds.length > 0) {
                for (let i = 0; i < newNode.parentIds.length; i++) {
                    const parentId = newNode.parentIds[i];

                    if (!newGraphNodesData.some(node => node.id === parentId)) {
                        const parentNode: GraphNode = { id: parentId, parentIds: [] };
                        newGraphNodesData.push(parentNode);
                    }
                }
            }
              newGraphNodesData.push(newNode);
          }

          return newGraphNodesData;
        });
      };

      const onMetaDataUpdated = (updatedMetadata: { [id: string]: IFeedBlockMetadata }) => {
        lastUpdateTime.current = Date.now();
        // console.log("updatedMetadata", updatedMetadata)
        setGraphNodes(prevGraphNodesData => {
            const updatedGraphNodesData = prevGraphNodesData.map(node => {
                if (node.data && updatedMetadata[node.id]) {
                    node.data.metadata = {
                        ...node.data.metadata,
                        ...updatedMetadata[node.id]
                    };
                }
                return node;
            });
            return updatedGraphNodesData;
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

  return graphNodes;
}
