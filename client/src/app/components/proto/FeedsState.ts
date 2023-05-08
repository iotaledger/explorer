<<<<<<<< HEAD:client/src/app/components/proto/FeedsState.ts
import { IAnalyticStats } from "../../../models/api/stats/IAnalyticStats";
import { IProtoStats } from "../../../models/api/stats/IProtoStats";
|||||||| dab2cbbd:client/src/app/components/stardust/FeedsState.ts
import { IAnalyticStats } from "../../../models/api/stats/IAnalyticStats";
import { IShimmerClaimed } from "../../../models/api/stats/IShimmerClaimed";
import { CurrencyState } from "../CurrencyState";
========
import { CurrencyState } from "../CurrencyState";
>>>>>>>> dev:client/src/app/components/legacy/FeedsState.ts

export interface FeedsState {
    /**
     * The items per second.
     */
    itemsPerSecond: string;

    /**
     * The confirmed items per second.
     */
    confirmedItemsPerSecond: string;

    /**
     * The confirmed items per second.
     */
    confirmedItemsPerSecondPercent: string;

    /**
     * The latest milestone index.
     */
    latestMilestoneIndex?: number;

    /**
     * The items per second.
     */
    itemsPerSecondHistory: number[];
<<<<<<<< HEAD:client/src/app/components/proto/FeedsState.ts

    /**
     * The chonicle analytic stats.
     */
    networkAnalytics?: IAnalyticStats;

    /**
     * The current mana stats.
     */
    protoStats?: IProtoStats;
|||||||| dab2cbbd:client/src/app/components/stardust/FeedsState.ts

    /**
     * The chonicle analytic stats.
     */
    networkAnalytics?: IAnalyticStats;

    /**
     * The shimmer token claimed stat for the network.
     */
    shimmerClaimed?: IShimmerClaimed;
========
>>>>>>>> dev:client/src/app/components/legacy/FeedsState.ts
}

