import { AliasOutput, hexToBytes } from "@iota/sdk-wasm-stardust/web";
import { useEffect, useState } from "react";
import { Converter } from "~helpers/stardust/convertUtils";

/**
 * Determine if an alias contains a DID
 * @param alias The alias output to check
 * @returns The result.
 */
export function useAliasContainsDID(alias: AliasOutput | null): [boolean] {
    const [aliasContainsDID, setAliasContainsDID] = useState<boolean>(false);

    useEffect(() => {
        if (alias && alias.stateMetadata && Converter.isHex(alias.stateMetadata, true)) {
            const metaDataBytes = hexToBytes(alias.stateMetadata);
            // Check if the first three bytes contain "DID" according to specification: https://wiki.iota.org/identity.rs/references/specifications/iota-did-method-spec/#anatomy-of-the-state-metadata
            if (metaDataBytes.length >= 3) {
                const testBytes = metaDataBytes.slice(0, 3);
                const testString = Converter.bytesToUtf8(testBytes);
                setAliasContainsDID(testString === "DID");
            }
        }
    }, [alias]);

    return [aliasContainsDID];
}
