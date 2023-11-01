import { Block, Unlock, PayloadType } from "@iota/sdk-wasm/web";
import { useContext, useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";
import NetworkContext from "../../app/context/NetworkContext";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IInput } from "../../models/api/stardust/IInput";
import { IOutput } from "../../models/api/stardust/IOutput";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustApiClient } from "../../services/stardust/stardustApiClient";
import { TransactionsHelper } from "../stardust/transactionsHelper";

/**
 * Fetch block inputs and outputs
 * @param network The Network in context
 * @param block The block
 * @returns The inputs, unlocks, outputs, transfer total an a loading bool.
 */
export function useInputsAndOutputs(network: string, block: Block | null):
    [
        IInput[] | null,
        Unlock[] | null,
        IOutput[] | null,
        number | null,
        boolean
    ] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const { bech32Hrp } = useContext(NetworkContext);
    const [tsxInputs, setInputs] = useState<IInput[] | null>(null);
    const [tsxUnlocks, setUnlocks] = useState<Unlock[] | null>(null);
    const [tsxOutputs, setOutputs] = useState<IOutput[] | null>(null);
    const [tsxTransferTotal, setTransferTotal] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (block?.payload?.type === PayloadType.Transaction) {
            // eslint-disable-next-line no-void
            void (async () => {
                const { inputs, unlocks, outputs, transferTotal } =
                    await TransactionsHelper.getInputsAndOutputs(
                        block,
                        network,
                        bech32Hrp,
                        apiClient
                    );
                if (isMounted) {
                    setInputs(inputs);
                    setUnlocks(unlocks);
                    setOutputs(outputs);
                    setTransferTotal(transferTotal);
                    setIsLoading(false);
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, block]);

    return [tsxInputs, tsxUnlocks, tsxOutputs, tsxTransferTotal, isLoading];
}
