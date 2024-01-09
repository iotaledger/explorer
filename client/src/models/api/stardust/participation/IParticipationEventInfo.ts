import { IParticipationEventPayload } from "./IParticipationEventPayload";
import { IParticipationEventStatus } from "./IParticipationEventStatus";

export interface IParticipationEventInfo {
  /**
   * The name of the event.
   */
  name: string;

  /**
   * The milestone index the commencing period starts.
   */
  milestoneIndexCommence: number;

  /**
   * The milestone index the holding period starts.
   */
  milestoneIndexStart: number;

  /**
   * The milestone index the event ends.
   */
  milestoneIndexEnd: number;

  /**
   * The payload of the event (ballot/staking).
   */
  payload: IParticipationEventPayload;

  /**
   * The additional description text about the event.
   */
  additionalInfo: string;

  /**
   * The status of the event.
   */
  status?: IParticipationEventStatus;
}
