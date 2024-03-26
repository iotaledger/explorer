/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
    Address,
    AddressType,
    AccountAddress,
    Ed25519Address,
    NftAddress,
    AnchorAddress,
    Utils,
    ImplicitAccountCreationAddress,
} from "@iota/sdk-nova";
import { plainToInstance } from "class-transformer";
import logger from "../../logger";
import { IAddressDetails } from "../../models/api/nova/IAddressDetails";
import { HexHelper } from "../hexHelper";

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
        let bech32: string;
        let hex: string;
        let type: AddressType;

        if (Utils.isAddressValid(addressString)) {
            try {
                const address: Address = Utils.parseBech32Address(addressString);

                if (address) {
                    const addressDetails = this.buildAddressFromTypes(address, hrp);

                    bech32 = addressDetails.bech32;
                    type = addressDetails.type;
                    hex = addressDetails.hex;
                }
            } catch (e) {
                logger.debug(`Failed parsing Address. Cause: ${e}`);
            }
        }

        if (!bech32) {
            // We assume this is hex
            hex = addressString;

            if (typeHint) {
                bech32 = this.computeBech32FromHexAndType(hex, typeHint, hrp);
            }
        }

        return {
            bech32,
            hex: hex ? HexHelper.addPrefix(hex) : hex,
            type: type ?? typeHint,
            label: AddressHelper.typeLabel(type),
        };
    }

    private static buildAddressFromTypes(address: Address, hrp: string): IAddressDetails {
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
            hex = innerAddress.pubKeyHash;
        }

        bech32 = Utils.addressToBech32(address, hrp);

        return {
            bech32,
            hex,
            type: address.type,
            label: AddressHelper.typeLabel(address.type),
        };
    }

    private static computeBech32FromHexAndType(hex: string, addressType: AddressType, hrp: string) {
        let bech32 = "";
        let address: Address | null = null;

        if (addressType === AddressType.Ed25519) {
            address = new Ed25519Address(hex);
        } else if (addressType === AddressType.Account) {
            address = new AccountAddress(hex);
        } else if (addressType === AddressType.Nft) {
            address = new NftAddress(hex);
        } else if (addressType === AddressType.Anchor) {
            address = new AnchorAddress(hex);
        } else if (addressType === AddressType.ImplicitAccountCreation) {
            address = new ImplicitAccountCreationAddress(hex);
        }

        if (address !== null) {
            bech32 = Utils.addressToBech32(address, hrp);
        }

        return bech32;
    }

    /**
     * Convert the address type number to a label.
     * @param addressType The address type to get the label for.
     * @returns The label.
     */
    private static typeLabel(addressType?: AddressType): string | undefined {
        if (addressType === AddressType.Ed25519) {
            return "Ed25519";
        } else if (addressType === AddressType.Account) {
            return "Account";
        } else if (addressType === AddressType.Nft) {
            return "NFT";
        } else if (addressType === AddressType.Anchor) {
            return "Anchor";
        } else if (addressType === AddressType.ImplicitAccountCreation) {
            return "Implicit Account Creation";
        }

        return "Unknown";
    }
}