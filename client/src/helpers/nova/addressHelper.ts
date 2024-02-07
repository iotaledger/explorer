import { Address, AddressType, AccountAddress, Ed25519Address, NftAddress, AnchorAddress, Utils } from "@iota/sdk-wasm-nova/web";
import { HexHelper } from "../stardust/hexHelper";
import { IAddressDetails } from "~models/api/nova/IAddressDetails";

export class AddressHelper {
    /**
     * Build the address details.
     * @param hrp The human readable part of the address.
     * @param address The address to source the data from.
     * @param typeHint The type of the address.
     * @returns The parts of the address.
     */
    public static buildAddress(hrp: string, address: string | Address, typeHint?: number): IAddressDetails {
        return typeof address === "string" ? this.buildAddressFromString(hrp, address, typeHint) : this.buildAddressFromTypes(address, hrp);
    }

    private static buildAddressFromString(hrp: string, addressString: string, typeHint?: number): IAddressDetails {
        let bech32;
        let hex;
        let type;

        if (Utils.isAddressValid(addressString)) {
            try {
                const address: Address = Utils.parseBech32Address(addressString);

                if (address) {
                    bech32 = addressString;
                    type = address.type;
                    hex = Utils.bech32ToHex(addressString);
                }
            } catch {}
        }

        if (!bech32) {
            // We assume this is hex and either use the hint or assume ed25519
            hex = addressString;
            type = typeHint ?? AddressType.Ed25519;
            bech32 = Utils.hexToBech32(hex, hrp);
        }

        return {
            bech32,
            hex: hex ? HexHelper.addPrefix(hex) : hex,
            type,
            label: AddressHelper.typeLabel(type),
            restricted: false,
        };
    }

    private static buildAddressFromTypes(address: Address, hrp: string): IAddressDetails {
        let hex: string = "";

        if (address.type === AddressType.Ed25519) {
            hex = HexHelper.stripPrefix((address as Ed25519Address).pubKeyHash);
        } else if (address.type === AddressType.Account) {
            hex = HexHelper.stripPrefix((address as AccountAddress).accountId);
        } else if (address.type === AddressType.Nft) {
            hex = HexHelper.stripPrefix((address as NftAddress).nftId);
        } else if (address.type === AddressType.Anchor) {
            hex = HexHelper.stripPrefix((address as AnchorAddress).anchorId);
        }

        return {
            bech32: Utils.hexToBech32(HexHelper.addPrefix(hex), hrp),
            hex,
            type: address.type,
            label: AddressHelper.typeLabel(address.type),
            restricted: false,
        };
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
        } else if (addressType === AddressType.Anchor) {
            return "Anchor";
        }
    }
}
