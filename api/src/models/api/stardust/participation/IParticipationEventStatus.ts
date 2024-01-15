export interface IParticipationEventStatus {
    /**
     * The status of the event. Valid options are: "upcoming", "commencing", "holding" and "ended".
     */
    status: string;

    /**
     * The milestone index the status was calculated for.
     */
    milestoneIndex: number;

    /**
     * The answer status of the different questions of the event.
     */
    questions?: { answers: { value: number; current: number; accumulated: number }[] }[];

    /**
     * The staking status of the event.
     */
    staking?: { staked: number; rewarded: number; symbol: string };

    /**
     * The SHA256 checksum of all the question and answer status or the staking amount and
     * rewards calculated for this MilestoneIndex.
     */
    checksum: string;
}
