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
} {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [dailyBlocks, setDailyBlocks] = useState<DataPoint[]>([]);
    const [dailyTransactions, setDailyTransactions] = useState<DataPoint[]>([]);
    const [dailyOutputs, setDailyOutputs] = useState<DataPoint[]>([]);

    useEffect(() => {
        apiClient
            .influxAnalytics({ network })
            .then((influxStats) => {
                if (!influxStats.error && influxStats) {
                    const graphsData: IStatisticsGraphsData = mapDailyStatsToGraphsData(influxStats);

                    setDailyBlocks(graphsData.blocksDaily);
                    setDailyTransactions(graphsData.transactionsDaily);
                    setDailyOutputs(graphsData.outputsDaily);
                } else {
                    console.error("Fetching influx stats failed", influxStats.error);
                }
            })
            .catch((e) => console.error("Influx analytics fetch failed", e));
    }, [network]);

    return { dailyBlocks, dailyTransactions, dailyOutputs };
}
