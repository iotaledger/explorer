import { useEffect, useState } from "react";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { useNetworkInfoNova } from "../networkInfo";
import { DataPoint, IStatisticsGraphsData, mapDailyStatsToGraphsData } from "../../nova/statisticsUtils";
import { IAnalyticStats } from "~/models/api/nova/stats/IAnalyticStats";

/**
 * State holder for Statistics page chart section.
 * @returns The charts state.
 */
export function useChartsState(): {
    blocksDaily: DataPoint[];
    blockIssuersDaily: DataPoint[];
    transactionsDaily: DataPoint[];
    outputsDaily: DataPoint[];
    tokensHeldDaily: DataPoint[];
    addressesWithBalanceDaily: DataPoint[];
    activeAddressesDaily: DataPoint[];
    tokensTransferredDaily: DataPoint[];
    anchorActivityDaily: DataPoint[];
    nftActivityDaily: DataPoint[];
    accountActivityDaily: DataPoint[];
    foundryActivityDaily: DataPoint[];
    delegationActivityDaily: DataPoint[];
    validatorsActivityDaily: DataPoint[];
    delegatorsActivityDaily: DataPoint[];
    delegationsActivityDaily: DataPoint[];
    stakingActivityDaily: DataPoint[];
    unlockConditionsPerTypeDaily: DataPoint[];
    tokensHeldWithUnlockConditionDaily: DataPoint[];
    ledgerSize: DataPoint[];
    storageDeposit: DataPoint[];
    manaBurnedDaily: DataPoint[];
    analyticStats: IAnalyticStats | null;
} {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [blocksDaily, setBlocksDaily] = useState<DataPoint[]>([]);
    const [blockIssuersDaily, setBlockIssuersDaily] = useState<DataPoint[]>([]);
    const [transactionsDaily, setTransactionsDaily] = useState<DataPoint[]>([]);
    const [outputsDaily, setOutputsDaily] = useState<DataPoint[]>([]);
    const [tokensHeldDaily, setTokensHeldDaily] = useState<DataPoint[]>([]);
    const [addressesWithBalanceDaily, setAddressesWithBalanceDaily] = useState<DataPoint[]>([]);
    const [activeAddressesDaily, setActiveAddressesDaily] = useState<DataPoint[]>([]);
    const [tokensTransferredDaily, setTokensTransferredDaily] = useState<DataPoint[]>([]);
    const [anchorActivityDaily, setAnchorActivityDaily] = useState<DataPoint[]>([]);
    const [nftActivityDaily, setNftActivityDaily] = useState<DataPoint[]>([]);
    const [accountActivityDaily, setAccountActivityDaily] = useState<DataPoint[]>([]);
    const [foundryActivityDaily, setFoundryActivityDaily] = useState<DataPoint[]>([]);
    const [delegationActivityDaily, setDelegationActivityDaily] = useState<DataPoint[]>([]);
    const [validatorsActivityDaily, setValidatorsActivityDaily] = useState<DataPoint[]>([]);
    const [delegatorsActivityDaily, setDelegatorsActivityDaily] = useState<DataPoint[]>([]);
    const [delegationsActivityDaily, setDelegationsActivityDaily] = useState<DataPoint[]>([]);
    const [stakingActivityDaily, setStakingActivityDaily] = useState<DataPoint[]>([]);
    const [unlockConditionsPerTypeDaily, setUnlockConditionsPerTypeDaily] = useState<DataPoint[]>([]);
    const [tokensHeldWithUnlockConditionDaily, setTokensHeldWithUnlockConditionDaily] = useState<DataPoint[]>([]);
    const [ledgerSize, setLedgerSize] = useState<DataPoint[]>([]);
    const [storageDeposit, setStorageDeposit] = useState<DataPoint[]>([]);
    const [manaBurnedDaily, setManaBurnedDaily] = useState<DataPoint[]>([]);

    const [analyticStats, setAnalyticStats] = useState<IAnalyticStats | null>(null);

    useEffect(() => {
        apiClient
            .influxAnalytics({ network })
            .then((influxStats) => {
                if (!influxStats.error && influxStats) {
                    const graphsData: IStatisticsGraphsData = mapDailyStatsToGraphsData(influxStats);

                    setBlocksDaily(graphsData.blocksDaily);
                    setBlockIssuersDaily(graphsData.blockIssuersDaily);
                    setTransactionsDaily(graphsData.transactionsDaily);
                    setOutputsDaily(graphsData.outputsDaily);
                    setTokensHeldDaily(graphsData.tokensHeldDaily);
                    setAddressesWithBalanceDaily(graphsData.addressesWithBalanceDaily);
                    setActiveAddressesDaily(graphsData.activeAddressesDaily);
                    setTokensTransferredDaily(graphsData.tokensTransferredDaily);
                    setAnchorActivityDaily(graphsData.anchorActivityDaily);
                    setNftActivityDaily(graphsData.nftActivityDaily);
                    setAccountActivityDaily(graphsData.accountActivityDaily);
                    setFoundryActivityDaily(graphsData.foundryActivityDaily);
                    setDelegationActivityDaily(graphsData.delegationActivityDaily);
                    setValidatorsActivityDaily(graphsData.validatorsActivityDaily);
                    setDelegatorsActivityDaily(graphsData.delegatorsActivityDaily);
                    setDelegationsActivityDaily(graphsData.delegationsActivityDaily);
                    setStakingActivityDaily(graphsData.stakingActivityDaily);
                    setUnlockConditionsPerTypeDaily(graphsData.unlockConditionsPerTypeDaily);
                    setTokensHeldWithUnlockConditionDaily(graphsData.tokensHeldWithUnlockConditionDaily);
                    setLedgerSize(graphsData.ledgerSizeDaily);
                    setStorageDeposit(graphsData.storageDepositDaily);
                    setManaBurnedDaily(graphsData.manaBurnedDaily);
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

    return {
        blocksDaily,
        blockIssuersDaily,
        transactionsDaily,
        outputsDaily,
        tokensHeldDaily,
        addressesWithBalanceDaily,
        activeAddressesDaily,
        tokensTransferredDaily,
        anchorActivityDaily,
        nftActivityDaily,
        accountActivityDaily,
        foundryActivityDaily,
        delegationActivityDaily,
        validatorsActivityDaily,
        delegatorsActivityDaily,
        delegationsActivityDaily,
        stakingActivityDaily,
        unlockConditionsPerTypeDaily,
        tokensHeldWithUnlockConditionDaily,
        ledgerSize,
        storageDeposit,
        manaBurnedDaily,
        analyticStats,
    };
}
