import { Block, PayloadType } from "@iota/sdk-wasm-nova/web";
import { useContext, useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import NetworkContext from "~app/context/NetworkContext";
import { ServiceFactory } from "~factories/serviceFactory";
import { IInput } from "~models/api/nova/IInput";
import { IOutput } from "~models/api/nova/IOutput";
import { STARDUST } from "~models/config/protocolVersion";
import { NovaApiClient } from "~services/nova/novaApiClient";
import { TransactionsHelper } from "../transactionsHelper";

/**
 * Fetch block inputs and outputs
 * @param network The Network in context
 * @param block The block
 * @returns The inputs, unlocks, outputs, transfer total an a loading bool.
 */
export function useInputsAndOutputs(network: string, block: Block | null):
    [
        IInput[] | null,
        IOutput[] | null,
        number | null,
        boolean
    ] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${STARDUST}`));
    const { bech32Hrp } = useContext(NetworkContext);
    const [tsxInputs, setInputs] = useState<IInput[] | null>(null);
    const [tsxOutputs, setOutputs] = useState<IOutput[] | null>(null);
    const [tsxTransferTotal, setTransferTotal] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (block?.body.asBasic().payload?.type === PayloadType.SignedTransaction) {
            // eslint-disable-next-line no-void
            void (async () => {
                const { inputs, outputs, transferTotal } =
                    await TransactionsHelper.getInputsAndOutputs(
                        block,
                        network,
                        bech32Hrp,
                        apiClient
                    );
                if (isMounted) {
                    setInputs(inputs);
                    setOutputs(outputs);
                    setTransferTotal(transferTotal);
                    setIsLoading(false);
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, block]);

    return [tsxInputs, tsxOutputs, tsxTransferTotal, isLoading];
}
