import { useEffect, useState } from "react";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { useNetworkInfoNova } from "../networkInfo";
import { DataPoint, IStatisticsGraphsData, mapDailyStatsToGraphsData } from "../../nova/statisticsUtils";

/**
 * State holder for Statistics page chart section.
 * @returns The charts state.
 */
export function useChartsState(): {
    dailyBlocks: DataPoint[];
    dailyTransactions: DataPoint[];
    dailyOutputs: DataPoint[];
    tokensHeld: DataPoint[];
    addressesWithBalance: DataPoint[];
    activeAddressesDaily: DataPoint[];
    tokensTransferredDaily: DataPoint[];
    anchorActivityDaily: DataPoint[];
    nftActivityDaily: DataPoint[];
    accountActivityDaily: DataPoint[];
    foundryActivityDaily: DataPoint[];
    delegationActivityDaily: DataPoint[];
    validatorsActivityDaily: DataPoint[];
    delegatorsActivityDaily: DataPoint[];
} {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [dailyBlocks, setDailyBlocks] = useState<DataPoint[]>([]);
    const [dailyTransactions, setDailyTransactions] = useState<DataPoint[]>([]);
    const [dailyOutputs, setDailyOutputs] = useState<DataPoint[]>([]);
    const [tokensHeld, setTokensHeld] = useState<DataPoint[]>([]);
    const [addressesWithBalance, setAddressesWithBalance] = useState<DataPoint[]>([]);
    const [activeAddressesDaily, setActiveAddressesDaily] = useState<DataPoint[]>([]);
    const [tokensTransferredDaily, setTokensTransferredDaily] = useState<DataPoint[]>([]);
    const [anchorActivityDaily, setAnchorActivityDaily] = useState<DataPoint[]>([]);
    const [nftActivityDaily, setNftActivityDaily] = useState<DataPoint[]>([]);
    const [accountActivityDaily, setAccountActivityDaily] = useState<DataPoint[]>([]);
    const [foundryActivityDaily, setFoundryActivityDaily] = useState<DataPoint[]>([]);
    const [delegationActivityDaily, setDelegationActivityDaily] = useState<DataPoint[]>([]);
    const [validatorsActivityDaily, setValidatorsActivityDaily] = useState<DataPoint[]>([]);
    const [delegatorsActivityDaily, setDelegatorsActivityDaily] = useState<DataPoint[]>([]);

    useEffect(() => {
        apiClient
            .influxAnalytics({ network })
            .then((influxStats) => {
                if (!influxStats.error && influxStats) {
                    const graphsData: IStatisticsGraphsData = mapDailyStatsToGraphsData(influxStats);

                    setDailyBlocks(graphsData.blocksDaily);
                    setDailyTransactions(graphsData.transactionsDaily);
                    setDailyOutputs(graphsData.outputsDaily);
                    setTokensHeld(graphsData.tokensHeldDaily);
                    setAddressesWithBalance(graphsData.addressesWithBalanceDaily);
                    setActiveAddressesDaily(graphsData.activeAddressesDaily);
                    setTokensTransferredDaily(graphsData.tokensTransferredDaily);
                    setAnchorActivityDaily(graphsData.anchorActivityDaily);
                    setNftActivityDaily(graphsData.nftActivityDaily);
                    setAccountActivityDaily(graphsData.accountActivityDaily);
                    setFoundryActivityDaily(graphsData.foundryActivityDaily);
                    setDelegationActivityDaily(graphsData.delegationActivityDaily);
                    setValidatorsActivityDaily(graphsData.validatorsActivityDaily);
                    setDelegatorsActivityDaily(graphsData.delegatorsActivityDaily);
                } else {
                    console.error("Fetching influx stats failed", influxStats.error);
                }
            })
            .catch((e) => console.error("Influx analytics fetch failed", e));
    }, [network]);

    return {
        dailyBlocks,
        dailyTransactions,
        dailyOutputs,
        tokensHeld,
        addressesWithBalance,
        activeAddressesDaily,
        tokensTransferredDaily,
        anchorActivityDaily,
        nftActivityDaily,
        accountActivityDaily,
        foundryActivityDaily,
        delegationActivityDaily,
        validatorsActivityDaily,
        delegatorsActivityDaily,
    };
}
