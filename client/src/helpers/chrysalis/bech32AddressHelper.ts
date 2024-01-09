import { Bech32Helper, ED25519_ADDRESS_TYPE } from "@iota/iota.js";
import { Converter } from "@iota/util.js";
import { IBech32AddressDetails } from "~models/api/IBech32AddressDetails";

export class Bech32AddressHelper {
  /**
   * Build the address details.
   * @param hrp The human readable part of the address.
   * @param address The address to source the data from.
   * @param typeHint The type of the address.
   * @returns The parts of the address.
   */
  public static buildAddress(hrp: string, address: string, typeHint?: number): IBech32AddressDetails {
    let bech32;
    let hex;
    let type;

    if (Bech32Helper.matches(address, hrp)) {
      try {
        const result = Bech32Helper.fromBech32(address, hrp);
        if (result) {
          bech32 = address;
          type = result.addressType;
          hex = Converter.bytesToHex(result.addressBytes);
        }
      } catch {}
    }

    if (!bech32) {
      // We assume this is hex and either use the hint or assume ed25519 for now
      hex = address;
      type = typeHint ?? ED25519_ADDRESS_TYPE;
      bech32 = Bech32Helper.toBech32(ED25519_ADDRESS_TYPE, Converter.hexToBytes(hex), hrp);
    }

    return {
      bech32,
      hex,
      type,
      typeLabel: Bech32AddressHelper.typeLabel(type),
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
