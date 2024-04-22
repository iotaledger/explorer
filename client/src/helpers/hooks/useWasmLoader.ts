import { useEffect, useState } from "react";
import initSdkStardust from "@iota/sdk-wasm-stardust/web";
import initSdkNova from "@iota/sdk-wasm-nova/web";
import { NOVA, STARDUST } from "~models/config/protocolVersion";

const STARDUST_WASM_PATH = "/wasm/iota_sdk_stardust_wasm_bg.wasm";
const NOVA_WASM_PATH = "/wasm/iota_sdk_nova_wasm_bg.wasm";

export function useWasmLoader(isServicesLoaded: boolean, networksLoaded: boolean, protocolVersion?: string) {
    const [isMainWasmLoaded, setWasmLoaded] = useState(false);

    useEffect(() => {
        if (!networksLoaded || !isServicesLoaded) return;

        const loadWasm = async () => {
            const origin = window?.location?.origin ?? "";
            const sdkStardustPath = origin + STARDUST_WASM_PATH;
            const sdkNovaPath = origin + NOVA_WASM_PATH;

            try {
                if (protocolVersion === STARDUST) {
                    await initSdkStardust(sdkStardustPath);
                    initSdkNova(sdkNovaPath);
                    setWasmLoaded(true);
                    return;
                }

                if (protocolVersion === NOVA) {
                    await initSdkNova(sdkNovaPath);
                    initSdkStardust(sdkStardustPath);
                    setWasmLoaded(true);
                    return;
                }

                setWasmLoaded(true);
                initSdkStardust(sdkStardustPath);
                initSdkNova(sdkNovaPath);
            } catch (err) {
                console.error("Error initializing SDK (wasm):", err);
            }
        };

        void loadWasm();
    }, [isServicesLoaded, protocolVersion, networksLoaded, setWasmLoaded]);

    return {
        isMainWasmLoaded,
    };
}
