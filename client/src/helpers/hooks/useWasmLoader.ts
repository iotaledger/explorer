import { useEffect, useState } from "react";
import initSdkStardust from "@iota/sdk-wasm/web";
import { STARDUST } from "~models/config/protocolVersion";

export function useWasmLoader(isServicesLoaded: boolean, networksLoaded: boolean, protocolVersion?: string) {
    const [isMainWasmLoaded, setWasmLoaded] = useState(false);

    useEffect(() => {
        if (!networksLoaded || !isServicesLoaded) return;

        const loadWasm = async () => {
            const origin = window?.location?.origin ?? "";
            const sdkStardustPath = origin + "/wasm/iota_sdk_stardust_wasm_bg.wasm";

            if (protocolVersion === STARDUST) {
                await initSdkStardust(sdkStardustPath);
                setWasmLoaded(true);
                return;
            }

            setWasmLoaded(true);
            initSdkStardust(sdkStardustPath).catch((err) => console.error("Error initializing Stardust SDK:", err));
        };

        void loadWasm();
    }, [isServicesLoaded, protocolVersion, networksLoaded, setWasmLoaded]);

    return {
        isMainWasmLoaded,
    };
}
