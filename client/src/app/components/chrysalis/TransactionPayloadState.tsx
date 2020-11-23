import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";

export interface TransactionPayloadState {
    formatFull?: boolean;

    unlockAddresses: IBech32AddressDetails[];
}
