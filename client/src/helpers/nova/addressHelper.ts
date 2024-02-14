import {
    Address,
    AddressType,
    AccountAddress,
    Ed25519Address,
    NftAddress,
    AnchorAddress,
    Utils,
    ImplicitAccountCreationAddress,
    RestrictedAddress,
} from "@iota/sdk-wasm-nova/web";
import { HexHelper } from "../stardust/hexHelper";
import { IAddressDetails } from "~models/api/nova/IAddressDetails";
import { plainToInstance } from "class-transformer";

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
            bech32 = this.computeBech32FromHexAndType(hex, type, hrp);
        }

        return {
            bech32,
            hex: hex ? HexHelper.addPrefix(hex) : hex,
            type,
            label: AddressHelper.typeLabel(type),
            restricted: false,
        };
    }

    private static buildAddressFromTypes(
        address: Address,
        hrp: string,
        restricted: boolean = false,
        capabilities?: number[],
    ): IAddressDetails {
        let hex: string = "";
        let bech32: string = "";

        if (address.type === AddressType.Ed25519) {
            hex = (address as Ed25519Address).pubKeyHash;
        } else if (address.type === AddressType.Account) {
            hex = (address as AccountAddress).accountId;
        } else if (address.type === AddressType.Nft) {
            hex = (address as NftAddress).nftId;
        } else if (address.type === AddressType.Anchor) {
            hex = (address as AnchorAddress).anchorId;
        } else if (address.type === AddressType.ImplicitAccountCreation) {
            const implicitAccountCreationAddress = plainToInstance(ImplicitAccountCreationAddress, address);
            const innerAddress = implicitAccountCreationAddress.address();
            hex = (innerAddress as Ed25519Address).pubKeyHash;
        } else if (address.type === AddressType.Restricted) {
            const restrictedAddress = plainToInstance(RestrictedAddress, address);
            const innerAddress = restrictedAddress.address;

            return this.buildAddressFromTypes(innerAddress, hrp, true, Array.from(restrictedAddress.getAllowedCapabilities()));
        }

        bech32 = this.computeBech32FromHexAndType(hex, address.type, hrp);

        return {
            bech32,
            hex,
            type: address.type,
            label: AddressHelper.typeLabel(address.type),
            restricted,
            capabilities,
        };
    }

    private static computeBech32FromHexAndType(hex: string, addressType: AddressType, hrp: string) {
        let bech32 = "";

        if (addressType === AddressType.Ed25519) {
            bech32 = Utils.hexToBech32(hex, hrp);
        } else if (addressType === AddressType.Account) {
            bech32 = Utils.accountIdToBech32(hex, hrp);
        } else if (addressType === AddressType.Nft) {
            bech32 = Utils.nftIdToBech32(hex, hrp);
        } else if (addressType === AddressType.Anchor) {
            // TODO Utils.anchorIdToBech32 does not exist https://github.com/iotaledger/iota-sdk/issues/1973
            bech32 = Utils.accountIdToBech32(hex, hrp);
        } else if (addressType === AddressType.ImplicitAccountCreation) {
            bech32 = Utils.hexToBech32(hex, hrp);
        }

        return bech32;
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
