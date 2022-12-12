import { IWsBPS, WsMsgType } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiEndpoint = (window as any).env.API_ENDPOINT as string;

/**
 *
 * @param network
 * @param txId
 */
export function useStats(network: string): [number, number, number] {
    const [bps, setBPS] = useState(0);
    const [inclusionRate, setInclusionRate] = useState(0);
    const [confirmationLatency, setConfirmationLatency] = useState(0);
    // const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        let socket: Socket;
        (async () => {
            socket = io(apiEndpoint, { upgrade: true, transports: ["websocket"] });

            socket?.emit(`proto-${WsMsgType.BPSMetric}`);
            socket?.on(WsMsgType.BPSMetric.toString(), async (data: IWsBPS) => {
                setBPS(data as number);
            });
        })();

        return () => {
            socket?.emit(`proto-${WsMsgType.NodeStatus}-leave`);
        };
    }, []);

    return [bps, inclusionRate, confirmationLatency];
}
