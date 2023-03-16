import { IBlock, IUTXOInput, TRANSACTION_PAYLOAD_TYPE, UnlockTypes } from "@iota/iota.js-stardust";
import { useContext, useEffect, useState } from "react";
import NetworkContext from "../../app/context/NetworkContext";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IInput } from "../../models/api/stardust/IInput";
import { IOutput } from "../../models/api/stardust/IOutput";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { TransactionsHelper } from "../stardust/transactionsHelper";

/**
 * Fetch block inputs and outputs
 * @param network The Network in context
 * @param block The block
 * @returns The inputs, unlocks, outputs, transfer total an a loading bool.
 */
export function useInputsAndOutputs(network: string, block: IBlock | null):
    [
        (IUTXOInput & IInput)[] | null,
        UnlockTypes[] | null,
        IOutput[] | null,
        number | null,
        boolean
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const { bech32Hrp } = useContext(NetworkContext);
    const [tsxInputs, setInputs] = useState<(IUTXOInput & IInput)[] | null >(null);
    const [tsxUnlocks, setUnlocks] = useState<UnlockTypes[] | null>(null);
    const [tsxOutputs, setOutputs] = useState<IOutput[] | null>(null);
    const [tsxTransferTotal, setTransferTotal] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (block?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
            // eslint-disable-next-line no-void
            void (async () => {
                const { inputs, unlocks, outputs, transferTotal } =
                    await TransactionsHelper.getInputsAndOutputs(
                        block,
                        network,
                        bech32Hrp,
                        tangleCacheService
                    );
                setInputs(inputs);
                setUnlocks(unlocks);
                setOutputs(outputs);
                setTransferTotal(transferTotal);
                setIsLoading(false);
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, block]);

    return [tsxInputs, tsxUnlocks, tsxOutputs, tsxTransferTotal, isLoading];
}
