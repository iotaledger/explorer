/**
 * The Structure of the Participation.
 */
export interface IParticipation {
  /**
   * The event id.
   */
  eventId: string;

  /**
   * The number of answers.
   */
  answersCount?: number;

  /**
   * The list of answer values.
   */
  answers?: number[];
}
