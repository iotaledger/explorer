import { IWsNodeStatus, WsMsgType } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiEndpoint = (window as any).env.API_ENDPOINT as string;

type Result = IWsNodeStatus | null | undefined;

const MAX_TRACKED_EPOCHS = 10;

/**
 *
 * @param network
 */
export function useStatusStream(network: string): [Result, number, number[]] {
    const [status, setStatus] = useState<IWsNodeStatus | null>();
    const [latestEpochIndices, setLatestEpochIndices] = useState<number[]>([]);
    const [lastEpochIndex, setLastEpochIndex] = useState(0);

    useEffect(() => {
        let socket: Socket;
        let lastEpochIndexLocal = 0;
        (async () => {
            socket = io(apiEndpoint, { upgrade: true, transports: ["websocket"] });

            socket?.emit(`proto-${WsMsgType.NodeStatus}`);
            socket?.on(WsMsgType.NodeStatus.toString(), async (data: IWsNodeStatus) => {
                setStatus(data);

                const confEpochIndex: number = data.tangleTime.confirmedEpoch;
                if (lastEpochIndexLocal === confEpochIndex) {
                    return;
                }

                lastEpochIndexLocal = confEpochIndex;
                setLastEpochIndex(confEpochIndex);

                if (latestEpochIndices.length === 0) {
                    const start = confEpochIndex - MAX_TRACKED_EPOCHS - 1;
                    for (let i = start; i < confEpochIndex; i++) {
                        latestEpochIndices.unshift(i);
                    }
                }

                latestEpochIndices.unshift(confEpochIndex);
                if (latestEpochIndices.length > MAX_TRACKED_EPOCHS) {
                    setLatestEpochIndices(latestEpochIndices.slice(0, MAX_TRACKED_EPOCHS));
                }
            });
        })();

        return () => {
            socket?.emit(`proto-${WsMsgType.NodeStatus}-leave`);
        };
    }, []);

    return [status, lastEpochIndex, latestEpochIndices];
}
