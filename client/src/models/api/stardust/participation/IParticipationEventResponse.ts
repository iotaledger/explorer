import { IParticipationEventInfo } from "./IParticipationEventInfo";
import { IParticipationEventStatus } from "./IParticipationEventStatus";
import { IResponse } from "../../IResponse";

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
