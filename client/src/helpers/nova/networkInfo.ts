import { BaseTokenResponse, ProtocolParametersResponse } from "@iota/sdk-wasm-nova/web";
import { create } from "zustand";

export const MANA_INFO_DEFAULT = {
    name: "Mana",
    tickerSymbol: "Mana",
    unit: "Mana",
    decimals: 6,
    subunit: "µMana",
    useMetricPrefix: false,
};

interface INetworkInfo {
    name: string;
    label: string;
    tokenInfo: BaseTokenResponse;
    manaInfo: BaseTokenResponse;
    protocolVersion: number;
    protocolInfo: ProtocolParametersResponse | null;
    latestConfirmedSlot: number;
    bech32Hrp: string;
}

interface NetworkInfoState {
    networkInfo: INetworkInfo;
    setNetworkInfo: (networkInfo: INetworkInfo) => void;
}

export const useNetworkInfoNova = create<NetworkInfoState>((set) => ({
    networkInfo: {
        name: "",
        label: "",
        tokenInfo: {
            name: "",
            tickerSymbol: "",
            unit: "",
            decimals: 0,
            subunit: undefined,
            useMetricPrefix: true,
        },
        manaInfo: MANA_INFO_DEFAULT,
        protocolVersion: -1,
        protocolInfo: null,
        latestConfirmedSlot: -1,
        bech32Hrp: "",
    },
    setNetworkInfo: (networkInfo) => {
        set({ networkInfo });
    },
}));
