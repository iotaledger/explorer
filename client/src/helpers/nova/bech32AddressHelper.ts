import { Bech32Helper } from "@iota/iota.js";
import { Address, AddressType, AccountAddress, Ed25519Address, NftAddress } from "@iota/sdk-wasm-nova/web";
import { Converter } from "../stardust/convertUtils";
import { HexHelper } from "../stardust/hexHelper";
import { IBech32AddressDetails } from "~models/api/IBech32AddressDetails";

export class Bech32AddressHelper {
    /**
     * Build the address details.
     * @param hrp The human readable part of the address.
     * @param address The address to source the data from.
     * @param typeHint The type of the address.
     * @returns The parts of the address.
     */
    public static buildAddress(hrp: string, address: string | Address, typeHint?: number): IBech32AddressDetails {
        return typeof address === "string" ? this.buildAddressFromString(hrp, address, typeHint) : this.buildAddressFromTypes(hrp, address);
    }

    private static buildAddressFromString(hrp: string, address: string, typeHint?: number): IBech32AddressDetails {
        let bech32;
        let hex;
        let type;

        if (Bech32Helper.matches(address, hrp)) {
            try {
                const result = Bech32Helper.fromBech32(address, hrp);
                if (result) {
                    bech32 = address;
                    type = result.addressType;
                    hex = Converter.bytesToHex(result.addressBytes, true);
                }
            } catch {}
        }

        if (!bech32) {
            // We assume this is hex and either use the hint or assume ed25519 for now
            hex = address;
            type = typeHint ?? AddressType.Ed25519;
            bech32 = Bech32Helper.toBech32(type, Converter.hexToBytes(hex), hrp);
        }

        return {
            bech32,
            hex,
            type,
            typeLabel: Bech32AddressHelper.typeLabel(type),
        };
    }

    private static buildAddressFromTypes(hrp: string, address: Address): IBech32AddressDetails {
        let hex: string = "";

        if (address.type === AddressType.Ed25519) {
            hex = HexHelper.stripPrefix((address as Ed25519Address).pubKeyHash);
        } else if (address.type === AddressType.Account) {
            hex = HexHelper.stripPrefix((address as AccountAddress).accountId);
        } else if (address.type === AddressType.Nft) {
            hex = HexHelper.stripPrefix((address as NftAddress).nftId);
        }

        return this.buildAddressFromString(hrp, hex, address.type);
    }

    /**
     * Convert the address type number to a label.
     * @param addressType The address type to get the label for.
     * @returns The label.
     */
    private static typeLabel(addressType?: number): string | undefined {
        if (addressType === AddressType.Ed25519) {
            return "Ed25519";
        } else if (addressType === AddressType.Account) {
            return "Account";
        } else if (addressType === AddressType.Nft) {
            return "NFT";
        }
    }
}
