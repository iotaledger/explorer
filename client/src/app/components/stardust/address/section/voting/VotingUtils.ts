import { IEventDetails } from "~helpers/stardust/hooks/useParticipationEventDetails";

export type VotingEventTab = "upcoming" | "commencing" | "holding" | "ended";

export const buildVotingEventTabs = (events: IEventDetails[]): VotingEventTab[] => {
    const tabs: VotingEventTab[] = [];
    if (events.length > 0) {
        if (events.some((event) => event.status?.status.startsWith("upcoming"))) {
            tabs.push("upcoming");
        }
        if (events.some((event) => event.status?.status.startsWith("commencing"))) {
            tabs.push("commencing");
        }
        if (events.some((event) => event.status?.status.startsWith("holding"))) {
            tabs.push("holding");
        }
        if (events.some((event) => event.status?.status.startsWith("ended"))) {
            tabs.push("ended");
        }
    }
    return tabs;
};
