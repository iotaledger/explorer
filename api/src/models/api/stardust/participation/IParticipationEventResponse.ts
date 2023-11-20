import { IResponse } from "../../IResponse";
import { IParticipationEventInfo } from "./IParticipationEventInfo";
import { IParticipationEventStatus } from "./IParticipationEventStatus";

export interface IParticipationEventResponse extends IResponse {
    /**
     * The event info
     */
    info?: IParticipationEventInfo;

    /**
     * The status of the event.
     */
    status?: IParticipationEventStatus;
}
