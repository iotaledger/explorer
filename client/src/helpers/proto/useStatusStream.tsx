import { IWsNodeStatus, WsMsgType } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiEndpoint = (window as any).env.API_ENDPOINT as string;

type Result = IWsNodeStatus | null | undefined;


const MAX_TRACKED_SLOTS = 10;
/**
 * @returns The hook.
 */
export function useStatusStream(): [Result, number, number[]] {
    const [status, setStatus] = useState<IWsNodeStatus | null>();
    const [latestSlotIndices, setLatestSlotIndices] = useState<number[]>([]);
    const [lastSlotIndex, setLastSlotIndex] = useState(0);

    useEffect(() => {
        let socket: Socket;
        let lastSlotIndexLocal = 0;
        // eslint-disable-next-line no-void
        void (async () => {
            socket = io(apiEndpoint, { upgrade: true, transports: ["websocket"] });

            socket?.emit(`proto-${WsMsgType.NodeStatus}`);
            socket?.on(WsMsgType.NodeStatus.toString(), async (data: IWsNodeStatus) => {
                setStatus(data);

                const confSlotIndex: number = data.tangleTime.confirmedSlot;
                if (lastSlotIndexLocal === confSlotIndex) {
                    return;
                }

                lastSlotIndexLocal = confSlotIndex;
                setLastSlotIndex(confSlotIndex);

                if (latestSlotIndices.length === 0) {
                    const start = confSlotIndex - MAX_TRACKED_SLOTS - 1;
                    for (let i = start; i < confSlotIndex; i++) {
                        latestSlotIndices.unshift(i);
                    }
                }

                latestSlotIndices.unshift(confSlotIndex);
                if (latestSlotIndices.length > MAX_TRACKED_SLOTS) {
                    setLatestSlotIndices(latestSlotIndices.slice(0, MAX_TRACKED_SLOTS));
                }
            });
        })();

        return () => {
            socket?.emit(`proto-${WsMsgType.NodeStatus}-leave`);
        };
    }, []);

    return [status, lastSlotIndex, latestSlotIndices];
}

