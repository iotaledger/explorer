import { IWsBPS, WsMsgType } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiEndpoint = (window as any).env.API_ENDPOINT as string;

/**
 *
 * @returns The txId
 */
export function useBPSStream(): [number] {
    const [bps, setBPS] = useState(0);

    useEffect(() => {
        let socket: Socket;
        // eslint-disable-next-line no-void
        void (async () => {
            socket = io(apiEndpoint, { upgrade: true, transports: ["websocket"] });

            socket?.emit(`proto-${WsMsgType.BPSMetric}`);
            socket?.on(WsMsgType.BPSMetric.toString(), async (data: IWsBPS) => {
                setBPS(data);
            });
        })();

        return () => {
            socket?.emit(`proto-${WsMsgType.NodeStatus}-leave`);
        };
    }, []);

    return [bps];
}

