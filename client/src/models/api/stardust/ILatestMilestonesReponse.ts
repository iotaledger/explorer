import { IMilestoneFeedItem } from "../../IMilestoneFeedItem";
import { IResponse } from "../IResponse";

export interface ILatestMilestonesReponse extends IResponse {
    /**
     * The latest milestones.
     */
    milestones: IMilestoneFeedItem[];
}

