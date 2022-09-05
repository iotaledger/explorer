import { IFeedItem } from "../../../models/feed/IFeedItem";
import { FeedsState } from "./FeedsState";

export interface SidePanelState extends FeedsState {
    /**
     * Latest items.
     */
    items: IFeedItem[];
}
