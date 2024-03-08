import React from "react";
import graphMessages from "~assets/modals/stardust/statistics/graphs.json";
import { useChartsState } from "~helpers/nova/hooks/useChartsState";
import { idGenerator } from "~helpers/stardust/statisticsUtils";
import Modal from "../../Modal";
import StackedLineChart from "../../stardust/statistics/charts/StackedLineChart";
import LineChart from "../../stardust/statistics/charts/LineChart";

export const InfluxChartsTab: React.FC = () => {
    const { dailyBlocks, dailyTransactions, dailyOutputs, tokensHeld, addressesWithBalance } = useChartsState();

    const ids = idGenerator();

    return (
        <div className="statistics-page--charts">
            <div className="section">
                <div className="section--header">
                    <h2>Blocks</h2>
                    <Modal icon="info" data={graphMessages.blocks} />
                </div>
                <div className="row statistics-row">
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Daily Blocks"
                        info={graphMessages.dailyBlocks}
                        subgroups={["transaction", "validation", "taggedData", "candidacy"]}
                        groupLabels={["Transaction", "Validation", "Tagged Data", "Candidacy announcement"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#99BEE1"]}
                        data={dailyBlocks}
                    />
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Daily Transactions"
                        info={graphMessages.dailyTransactions}
                        subgroups={["finalized", "failed"]}
                        groupLabels={["Finalized", "Failed"]}
                        colors={["#00E0CA", "#36A1AC"]}
                        data={dailyTransactions}
                    />
                </div>
            </div>
            <div className="section">
                <div className="section--header">
                    <h2>Outputs</h2>
                    <Modal icon="info" data={graphMessages.outputs} />
                </div>
                <div className="row statistics-row">
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Total Outputs by Type"
                        info={graphMessages.totalOutputs}
                        subgroups={["basic", "account", "foundry", "nft", "anchor", "delegation"]}
                        groupLabels={["Basic", "Account", "Foundry", "Nft", "Anchor", "Delegation"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#186575", "#99BEE1", "#00E0CA"]}
                        data={dailyOutputs}
                    />
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Total Tokens by Output Type"
                        info={graphMessages.totalTokens}
                        subgroups={["basic", "account", "foundry", "nft", "anchor", "delegation"]}
                        groupLabels={["Basic", "Account", "Foundry", "Nft", "Anchor", "Delegation"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#186575", "#99BEE1", "#00E0CA"]}
                        data={tokensHeld}
                    />
                </div>
            </div>
            <div className="section">
                <div className="section--header">
                    <h2>Addresses and Tokens</h2>
                    <Modal icon="info" data={graphMessages.addressesAndTokens} />
                </div>
                <div className="row statistics-row margin-b-s">
                    <LineChart
                        chartId={ids.next().value}
                        title="Total Addresses with Tokens"
                        info={graphMessages.totalAddressesWithTokens}
                        label="Addresses"
                        color="#00F5DD"
                        data={addressesWithBalance}
                    />
                </div>
            </div>
        </div>
    );
};
