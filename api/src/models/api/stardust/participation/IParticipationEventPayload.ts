import { IParticipationEventQuestion } from "./IParticipationEventQuestion";

export interface IParticipationEventPayload {
    /**
     * The type of the event.
     */
    type: number;

    /**
     *  The questions of the ballot and their possible answers.
     */
    questions?: IParticipationEventQuestion[];

    /**
     * The description text of the participation event.
     */
    text?: string;

    /**
     * The symbol of the rewarded token.
     */
    symbol?: string;

    /**
     * The numerator is used in combination with Denominator to calculate the rewards per milestone per staked tokens.
     */
    numerator?: number;

    /**
     * The denominator is used in combination with Numerator to calculate the rewards per milestone per staked tokens.
     */
    denominator?: number;

    /**
     * The minimum rewards required to be included in the staking results.
     */
    requiredMinimumRewards?: number;

    /**
     * The additional description text about the participation event.
     */
     additionalInfo?: string;
}
