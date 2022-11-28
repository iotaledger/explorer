import moment from "moment";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustApiClient } from "../../../../services/stardust/stardustApiClient";
import LineChart from "../../../components/stardust/statistics/LineChart";
import StackedBarChart from "../../../components/stardust/statistics/StackedBarChart";
import BarChart from "../../../components/stardust/statistics/BarChart";
import ChartLegend from "../../../components/stardust/statistics/ChartLegend";
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
    const [transactions, setTransactions] = useState<DataView[] | null>(null);
    const [dailyBlocks, setDailyBlocks] = useState<DataView[] | null>(null);
    const [outputs, setOutputs] = useState<DataView[] | null>(null);
    const [tokensHeld, setTokensHeld] = useState<DataView[] | null>(null);
    const [addressesWithBalance, setAddressesWithBalance] = useState<DataView[] | null>(null);
    const [avgAddressesPerMilestone, setAvgAddressesPerMilestone] = useState<DataView[] | null>(null);
    const [tokensTransferred, setTokensTransferred] = useState<DataView[] | null>(null);

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

                const updateOutputs: DataView[] = response.outputsDaily?.map(output => (
                    {
                        time: moment(output.time).add(1, "minute").unix(),
                        basic: output.basic ?? 0,
                        alias: output.alias ?? 0,
                        foundry: output.foundry ?? 0,
                        nft: output.nft ?? 0
                    }
                )) ?? [];

                const updateTokensHeld: DataView[] = response.tokensHeldDaily?.map(day => (
                    {
                        time: moment(day.time).add(1, "minute").unix(),
                        basic: day.basic ?? 0,
                        alias: day.alias ?? 0,
                        foundry: day.foundry ?? 0,
                        nft: day.nft ?? 0
                    }
                )) ?? [];

                const updateAddresses: DataView[] = response.addressesWithBalanceDaily?.map(entry => (
                    {
                        time: moment(entry.time).add(1, "minute").unix(),
                        n: entry.addressesWithBalance ?? 0
                    }
                )) ?? [];

                const updateAvgAddressPerMilestone: DataView[] = response.avgAddressesPerMilestoneDaily?.map(day => (
                    {
                        time: moment(day.time).add(1, "minute").unix(),
                        sending: day.addressesSending ?? 0,
                        receiving: day.addressesReceiving ?? 0
                    }
                )) ?? [];

                const updateTokensTransferred: DataView[] = response.tokensTransferredDaily?.map(day => (
                    {
                        time: moment(day.time).add(1, "minute").unix(),
                        n: day.tokens ?? 0
                    }
                )) ?? [];

                setDailyBlocks(update.slice(-7));
                setTransactions(updateTransactions.slice(-7));
                setOutputs(updateOutputs.slice(-7));
                setTokensHeld(updateTokensHeld.slice(-7));
                setAddressesWithBalance(updateAddresses.slice(-7));
                setAvgAddressesPerMilestone(updateAvgAddressPerMilestone.slice(-7));
                setTokensTransferred(updateTokensTransferred.slice(-7));
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
                                <h2>Blocks</h2>
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
                                    <h2>Outputs</h2>
                                </div>
                                <div className="row space-between">
                                    {outputs && (
                                        <StackedBarChart
                                            width={560}
                                            height={350}
                                            subgroups={["basic", "alias", "foundry", "nft"]}
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff", "#ff780a"]}
                                            data={outputs}
                                        />
                                    )}
                                    {tokensHeld && (
                                        <StackedBarChart
                                            width={560}
                                            height={350}
                                            subgroups={["basic", "alias", "foundry", "nft"]}
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff", "#ff780a"]}
                                            data={tokensHeld}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="section">
                                <div className="section--header">
                                    <h2>Addresses and Tokens</h2>
                                </div>
                                <div className="row space-between">
                                    {addressesWithBalance && (
                                        <LineChart
                                            width={560}
                                            height={350}
                                            data={addressesWithBalance}
                                        />
                                    )}
                                    {avgAddressesPerMilestone && (
                                        <StackedBarChart
                                            width={560}
                                            height={350}
                                            subgroups={["sending", "receiving"]}
                                            colors={["#73bf69", "#f2cc0d"]}
                                            data={avgAddressesPerMilestone}
                                        />
                                    )}
                                </div>
                                <div className="row space-between">
                                    {tokensTransferred && (
                                        <BarChart
                                            width={560}
                                            height={350}
                                            data={tokensTransferred}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;

