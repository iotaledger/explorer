import {
    IAddressResponse,
    IAliasOutput,
    IExtendedLockedOutput,
    IOutput,
    ISigLockedColoredOutput,
    ISigLockedSingleOutput,
    OutputTypeName
} from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IAddressResponse | null | undefined;

/**
 *
 * @param network
 * @param addressBase58
 */
export function useAddress(network: string, addressBase58: string): [Result, boolean] {
    const [addr, setAddr] = useState<IAddressResponse | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const fetchedAddr = await apiClient.address({ network, addressBase58 });
                if (fetchedAddr.error) {
                    throw new Error(fetchedAddr.error);
                }
                setAddr(fetchedAddr.address);
            } catch {
                setAddr(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [addressBase58]);

    return [addr, isLoading];
}

/**
 *
 * @param unspentOutputs
 */
export function calcBalance(unspentOutputs: IOutput[]): Map<string, number> {
    const m = new Map<string, number>();
    for (const iOutput of unspentOutputs) {
        let balances: Record<string, unknown> = {};
        switch (iOutput.type) {
            case OutputTypeName.AliasOutputType.toString(): {
                const x = iOutput.output as IAliasOutput;
                balances = x.balances;
                break;
            }
            case OutputTypeName.SigLockedColoredOutputType.toString(): {
                const x = iOutput.output as ISigLockedColoredOutput;
                balances = x.balances;
                break;
            }
            case OutputTypeName.ExtendedLockedOutputType.toString(): {
                const x = iOutput.output as IExtendedLockedOutput;
                balances = x.balances;
                break;
            }
            case OutputTypeName.SigLockedSingleOutputType.toString(): {
                const x = iOutput.output as ISigLockedSingleOutput;
                balances = { [x.address]: x.balance };
                break;
            }
            default:
                break;
        }
        for (const k of Object.keys(balances)) {
            const deposit = balances[k] as number;
            const previous = m.get(k) ?? 0;
            m.set(k, previous + deposit);
        }
    }
    return m;
}
