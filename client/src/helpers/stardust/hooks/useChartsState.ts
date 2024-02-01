import { useContext, useEffect, useState } from "react";
import NetworkContext from "~app/context/NetworkContext";
import { ServiceFactory } from "~factories/serviceFactory";
import { IAnalyticStats } from "~models/api/stats/IAnalyticStats";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { DataPoint, IStatisticsGraphsData, mapDailyStatsToGraphsData } from "../statisticsUtils";

/**
 * State holder for Statistics page chart section.
 * @returns The charts state.
 */
export function useChartsState(): [
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    DataPoint[],
    IAnalyticStats | null,
] {
    const { name: network } = useContext(NetworkContext);
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [transactions, setTransactions] = useState<DataPoint[]>([]);
    const [dailyBlocks, setDailyBlocks] = useState<DataPoint[]>([]);
    const [outputs, setOutputs] = useState<DataPoint[]>([]);
    const [tokensHeld, setTokensHeld] = useState<DataPoint[]>([]);
    const [addressesWithBalance, setAddressesWithBalance] = useState<DataPoint[]>([]);
    const [activeAddresses, setActiveAddresses] = useState<DataPoint[]>([]);
    const [tokensTransferred, setTokensTransferred] = useState<DataPoint[]>([]);
    const [aliasActivity, setAliasActivity] = useState<DataPoint[]>([]);
    const [unlockConditionsPerType, setUnlockConditionsPerType] = useState<DataPoint[]>([]);
    const [nftActivity, setNftActivity] = useState<DataPoint[]>([]);
    const [tokensHeldWithUnlockCondition, setTokensHeldWithUnlockCondition] = useState<DataPoint[]>([]);
    const [unclaimedTokens, setUnclaimedTokens] = useState<DataPoint[]>([]);
    const [unclaimedGenesisOutputs, setUnclaimedGenesisOutputs] = useState<DataPoint[]>([]);
    const [ledgerSize, setLedgerSize] = useState<DataPoint[]>([]);
    const [storageDeposit, setStorageDeposit] = useState<DataPoint[]>([]);

    const [analyticStats, setAnalyticStats] = useState<IAnalyticStats | null>(null);

    useEffect(() => {
        apiClient
            .influxAnalytics({ network })
            .then((influxStats) => {
                if (!influxStats.error && influxStats) {
                    const graphsData: IStatisticsGraphsData = mapDailyStatsToGraphsData(influxStats);

                    setDailyBlocks(graphsData.blocksDaily);
                    setTransactions(graphsData.transactionsDaily);
                    setOutputs(graphsData.outputsDaily);
                    setTokensHeld(graphsData.tokensHeldDaily);
                    setAddressesWithBalance(graphsData.addressesWithBalanceDaily);
                    setActiveAddresses(graphsData.activeAddresses);
                    setTokensTransferred(graphsData.tokensTransferredDaily);
                    setAliasActivity(graphsData.aliasActivityDaily);
                    setUnlockConditionsPerType(graphsData.unlockConditionsPerTypeDaily);
                    setNftActivity(graphsData.nftActivityDaily);
                    setTokensHeldWithUnlockCondition(graphsData.tokensHeldWithUnlockConditionDaily);
                    setUnclaimedTokens(graphsData.unclaimedTokensDaily);
                    setUnclaimedGenesisOutputs(graphsData.unclaimedGenesisOutputsDaily);
                    setLedgerSize(graphsData.ledgerSizeDaily);
                    setStorageDeposit(graphsData.storageDepositDaily);
                } else {
                    console.error("Fetching influx stats failed", influxStats.error);
                }
            })
            .catch((e) => console.error("Influx analytics fetch failed", e));

        apiClient
            .chronicleAnalytics({ network })
            .then((analytics) => {
                if (!analytics.error && analytics) {
                    setAnalyticStats(analytics);
                } else {
                    console.error("Fetching chronicle stats failed", analytics.error);
                }
            })
            .catch((e) => console.error("Chronicle analytics fetch failed", e));
    }, [network]);

    return [
        transactions,
        dailyBlocks,
        outputs,
        tokensHeld,
        addressesWithBalance,
        activeAddresses,
        tokensTransferred,
        aliasActivity,
        unlockConditionsPerType,
        nftActivity,
        tokensHeldWithUnlockCondition,
        unclaimedTokens,
        unclaimedGenesisOutputs,
        ledgerSize,
        storageDeposit,
        analyticStats,
    ];
}
