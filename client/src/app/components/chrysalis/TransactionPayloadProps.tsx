import { IUTXOInput } from "@iota/iota.js";
import * as H from "history";
import { IBech32AddressDetails } from "~models/api/IBech32AddressDetails";
export interface TransactionPayloadProps {
  /**
   * The network to lookup.
   */
  network: string;

  /**
   * The unlock addresses for the transactions.
   */
  inputs: (IUTXOInput & {
    outputHash: string;
    isGenesis: boolean;
    transactionUrl: string;
    transactionAddress: IBech32AddressDetails;
    signature: string;
    publicKey: string;
    amount: number;
  })[];

  /**
   * The outputs.
   */
  outputs: {
    index: number;
    type: number;
    address: IBech32AddressDetails;
    amount: number;
    isRemainder: boolean;
  }[];

  /**
   * The total of the transfer excluding remainders.
   */
  transferTotal: number;

  /**
   * History for navigation.
   */
  history: H.History;
}
