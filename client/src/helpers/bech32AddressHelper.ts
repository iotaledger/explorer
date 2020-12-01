import { Bech32Helper, Converter, ED25519_ADDRESS_TYPE } from "@iota/iota2.js";
import { IBech32AddressDetails } from "../models/IBech32AddressDetails";

export class Bech32AddressHelper {
    /**
     * Build the address details.
     * @param address The address to source the data from.
     * @returns The parts of the address.
     */
    public static buildAddress(address: string): IBech32AddressDetails {
        let bech32;
        let hex;
        let type;

        if (Bech32Helper.matches(address)) {
            try {
                const result = Bech32Helper.fromBech32(address);
                if (result) {
                    bech32 = address;
                    type = result.addressType;
                    hex = Converter.bytesToHex(result.addressBytes);
                }
            } catch {
            }
        }

        if (!bech32) {
            // We assume this is hex and ed25519 for now
            hex = address;
            type = ED25519_ADDRESS_TYPE;
            bech32 = Bech32Helper.toBech32(ED25519_ADDRESS_TYPE, Converter.hexToBytes(hex));
        }

        return {
            bech32,
            hex,
            type,
            typeLabel: Bech32AddressHelper.typeLabel(type)
        };
    }

    /**
     * Convert the address type number to a label.
     * @param addressType The address type to get the label for.
     * @returns The label.
     */
    public static typeLabel(addressType?: number): string | undefined {
        if (addressType === ED25519_ADDRESS_TYPE) {
            return "Ed25519";
        }
    }
}
