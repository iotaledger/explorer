import { Blake2b } from "./crypto";
import { ReadStream } from "./readStreamUtils";

/**
 * The length of the participation event id.
 */
const EVENT_ID_SIZE: number = Blake2b.SIZE_256;

/**
 * The participation event.
 */
interface Participation {
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

/**
 * Deserialize the participation event metadata from binary.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
export function deserializeParticipationEventMetadata(readStream: ReadStream): Participation[] {
  const participationsCount = readStream.readUInt8("participation.count");

  const participations: Participation[] = [];
  for (let i = 0; i < participationsCount; i++) {
    participations.push(deserializeParticipation(readStream));
  }

  return participations;
}

/**
 * Deserialize the participation event.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
function deserializeParticipation(readStream: ReadStream): Participation {
  const eventId = readStream.readFixedHex("participation.eventId", EVENT_ID_SIZE);

  const answersCount = readStream.readUInt8("participation.answersCount");

  const answers: number[] = [];
  for (let i = 0; i < answersCount; i++) {
    answers.push(readStream.readUInt8(`participation.answers${i}`));
  }

  return {
    eventId,
    answersCount,
    answers,
  };
}
