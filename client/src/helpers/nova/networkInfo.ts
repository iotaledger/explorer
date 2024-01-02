import { INodeInfoBaseToken } from "@iota/sdk-wasm-nova/web";
import { create } from "zustand";

interface INetworkInfo {
    name: string;
    tokenInfo: INodeInfoBaseToken;
    protocolVersion: number;
    bech32Hrp: string;
}

interface NetworkInfoState {
    networkInfo: INetworkInfo;
    setNetworkInfo: (networkInfo: INetworkInfo) => void;
}

export const useNetworkInfoNova = create<NetworkInfoState>((set) => ({
    networkInfo: {
        name: "",
        tokenInfo: {
            name: "",
            tickerSymbol: "",
            unit: "",
            decimals: 0,
            subunit: undefined,
            useMetricPrefix: true,
        },
        protocolVersion: -1,
        bech32Hrp: "",
    },
    setNetworkInfo: (networkInfo) => {
        set({ networkInfo });
    },
}));
