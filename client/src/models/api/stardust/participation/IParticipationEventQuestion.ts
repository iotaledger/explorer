import { IParticipationEventAnswer } from "./IParticipationEventAnswer";

export interface IParticipationEventQuestion {
    /**
     * The text of the question.
     */
    text: string;

    /**
     * The possible answers to the question.
     */
    answers: IParticipationEventAnswer[];

    /**
     * The additional description text about the question.
     */
    additionalInfo: string;
}
