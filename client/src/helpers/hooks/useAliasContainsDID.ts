import { AliasOutput, hexToUtf8 } from "@iota/sdk-wasm/web";
import { useEffect, useState } from "react";

/**
 * Determine if an alias contains a DID
 * @param alias The alias output to check
 * @returns The result.
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

