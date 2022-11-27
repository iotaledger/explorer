import moment from "moment";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustApiClient } from "../../../../services/stardust/stardustApiClient";
import LineChart from "../../../components/stardust/statistics/LineChart";
import StackedBarChart from "../../../components/stardust/statistics/StackedBarChart";
import BarChart from "./BarChart";
import "./StatisticsPage.scss";

interface StatisticsPageProps {
    network: string;
}

export interface DataView {
    [key: string]: number;
    time: number;
}

const StatisticsPage: React.FC<RouteComponentProps<StatisticsPageProps>> = ({ match: { params: { network } } }) => {
    const [apiClient] = useState(
        ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`)
    );
    const [dailyBlocksSum, setDailyBlocksSum] = useState<DataView[] | null>(null);
    const [transactions, setTransactions] = useState<DataView[] | null>(null);
    const [dailyBlocks, setDailyBlocks] = useState<DataView[] | null>(null);
    const [addressesWithBalance, setAddressesWithBalance] = useState<DataView[] | null>(null);

    useEffect(() => {
        apiClient.influxAnalytics({ network }).then(response => {
            if (!response.error) {
                console.log("Influx response", response);
                const update: DataView[] = response.blocksDaily.map(day => (
                    {
                        time: moment(day.time).add(1, "minute").unix(),
                        transaction: day.transaction ?? 0,
                        milestone: day.milestone ?? 0,
                        taggedData: day.taggedData ?? 0,
                        noPayload: day.noPayload ?? 0
                    }
                ));

                const updateTransactions: DataView[] = response.transactionsDaily.map(t => (
                    {
                        time: moment(t.time).add(1, "minute").unix(),
                        confirmed: t.confirmed ?? 0,
                        conflicting: t.conflicting ?? 0
                    }
                ));

                const updateSum: DataView[] = response.blocksDaily.map(day => (
                    {
                        time: moment(day.time).add(1, "minute").unix(),
                        n: (day.transaction ?? 0) + (day.milestone ?? 0) + (day.taggedData ?? 0) + (day.noPayload ?? 0)
                    }
                ));

                const updateAddresses: DataView[] = response.addressesWithBalanceDaily?.map(entry => (
                    {
                        time: moment(entry.time).add(1, "minute").unix(),
                        n: entry.addressesWithBalance ?? 0
                    }
                )) ?? [];

                setDailyBlocksSum(updateSum.slice(-7));
                setTransactions(updateTransactions.slice(-7));
                setDailyBlocks(update.slice(-7));

                setAddressesWithBalance(updateAddresses.slice(-7));
            } else {
                console.log("Fetching statistics failed", response.error);
            }
        }).catch(e => console.log("Influx analytics query failed", e));
    }, []);

    return (
        <div className="statistics-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="statistics-page--header">
                        <div className="row middle">
                            <h1>
                                Statistics
                            </h1>
                        </div>
                    </div>
                    <div className="statistics-page--content">
                        <div className="section">
                            <div className="section--header">
                                <h2>Block</h2>
                            </div>
                            <div className="row space-between">
                                {dailyBlocks && (
                                    <StackedBarChart
                                        width={560}
                                        height={350}
                                        subgroups={["transaction", "milestone", "taggedData", "noPayload"]}
                                        colors={["#73bf69", "#f2cc0d", "#8ab8ff", "#ff780a"]}
                                        data={dailyBlocks}
                                    />
                                )}
                                {transactions && (
                                    <StackedBarChart
                                        width={560}
                                        height={350}
                                        subgroups={["confirmed", "conflicting"]}
                                        colors={["#73bf69", "#f2cc0d"]}
                                        data={transactions}
                                    />
                                )}
                            </div>
                            <div className="section">
                                <div className="section--header">
                                    <h2>Output</h2>
                                </div>
                                <div className="row space-between">
                                    {addressesWithBalance && (
                                        <LineChart
                                            width={560}
                                            height={350}
                                            data={addressesWithBalance}
                                        />
                                    )}
                                </div>
                            </div>
                            {dailyBlocksSum && (
                                <BarChart
                                    width={1172}
                                    height={550}
                                    data={dailyBlocksSum}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;

