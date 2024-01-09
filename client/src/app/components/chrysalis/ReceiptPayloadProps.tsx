import { IReceiptPayload } from "@iota/iota.js";
import * as H from "history";

export interface ReceiptPayloadProps {
  /**
   * The network to lookup.
   */
  network: string;

  /**
   * The receipt payload.
   */
  payload: IReceiptPayload;

  /**
   * Display advanced mode.
   */
  advancedMode: boolean;

  /**
   * History for navigation.
   */
  history?: H.History;
}
