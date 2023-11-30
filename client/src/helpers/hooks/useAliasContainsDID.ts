import { AliasOutput, hexToUtf8 } from "@iota/sdk-wasm/web";
import { useEffect, useState } from "react";

/** TODO
 * Fetch Address alias UTXOs
 * @param network The Network in context
 * @param addressBech32 The address in bech32 format
 * @returns The output responses and loading bool.
 */
export function useAliasContainsDID(
    alias: AliasOutput | null
): [boolean] {
    const [aliasContainsDID, setAliasContainsDID] = useState<boolean>(false);

    useEffect(() => {
        if(alias && alias.stateMetadata) {
            setAliasContainsDID(hexToUtf8(alias.stateMetadata).startsWith("DID") ?? false)
        }
    }, [alias]);

    return [aliasContainsDID];
}

