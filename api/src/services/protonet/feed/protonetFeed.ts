import { WebSocketClient, WsMsgType } from "@iota/protonet.js";
import { Server as SocketIOServer } from "socket.io";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";

/**
 * Wrapper class for Protonet feed.
 */
export class ProtonetFeed {
    /**
     * The feed subscribers (downstream).
     */
    protected readonly subscribers: {
        [id: string]: (data: unknown) => Promise<void>;
    };

    /**
     * Websocket client (upstream).
     */
    private readonly wsClient: WebSocketClient;

    /**
     * Websocket server (downstream).
     */
    private readonly wsServer: SocketIOServer;

    /**
     * Creates a new instance of ProtonetFeed.
     * @param networkId The network id.
     * @param wsServer The current wsServer instance.
     */
    constructor(networkId: string, wsServer: SocketIOServer) {
        this.subscribers = {};
        this.wsClient = ServiceFactory.get<WebSocketClient>(`proto-ws-${networkId}`);
        this.wsServer = wsServer;

        if (this.wsClient) {
            this.connect();
        } else {
            throw new Error(`Failed to build protonet instance for ${networkId}`);
        }
    }

    /**
     * Connects the callbacks for upstream data.
     */
    private connect() {
        logger.verbose("[ProtonetFeed] Attaching upstream listeners.");
        this.wsClient.onNodeStatus(msg => {
            const key = WsMsgType.NodeStatus.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onBpsMetric(msg => {
            const key = WsMsgType.BPSMetric.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onBlock(msg => {
            const key = WsMsgType.Block.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onNeighborMetrics(msg => {
            const key = WsMsgType.NeighborMetrics.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onComponentCounterMetric(msg => {
            const key = WsMsgType.ComponentCounterMetrics.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onTipsMetric(msg => {
            const key = WsMsgType.TipsMetric.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onVertex(msg => {
            const key = WsMsgType.Vertex.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onTipInfo(msg => {
            const key = WsMsgType.TipInfo.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onManaValue(msg => {
            const key = WsMsgType.ManaValue.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onManaMapOverall(msg => {
            const key = WsMsgType.ManaMapOverall.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onManaMapOnline(msg => {
            const key = WsMsgType.ManaMapOnline.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onRateSetterMetric(msg => {
            const key = WsMsgType.RateSetterMetric.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onConflictsConflictSet(msg => {
            const key = WsMsgType.ConflictsConflictSet.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });

        this.wsClient.onConflictsConflict(msg => {
            const key = WsMsgType.ConflictsConflict.toString();
            this.wsServer.to(`proto-${key}`).emit(key, msg);
        });
    }
}

