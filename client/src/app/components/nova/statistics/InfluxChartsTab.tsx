import React from "react";
import graphMessages from "~assets/modals/nova/statistics/graphs.json";
import { useChartsState } from "~helpers/nova/hooks/useChartsState";
import { idGenerator } from "~helpers/stardust/statisticsUtils";
import Modal from "../../Modal";
import StackedLineChart from "../../stardust/statistics/charts/StackedLineChart";
import LineChart from "../../stardust/statistics/charts/LineChart";
import BarChart from "../../stardust/statistics/charts/BarChart";
import StackedBarChart from "../../stardust/statistics/charts/StackedBarChart";

export const InfluxChartsTab: React.FC = () => {
    const {
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
    } = useChartsState();

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
                    <LineChart
                        chartId={ids.next().value}
                        title="Daily Active Addresses"
                        info={graphMessages.dailyActiveAddresses}
                        label="Addresses"
                        color="#00F5DD"
                        data={activeAddressesDaily}
                    />
                </div>
                <div className="row statistics-row">
                    <BarChart
                        chartId={ids.next().value}
                        title="Daily Sent Tokens"
                        info={graphMessages.dailySentTokens}
                        color="#00E0CA"
                        label="Tokens"
                        data={tokensTransferredDaily}
                    />
                </div>
            </div>
            <div className="section">
                <div className="section--header">
                    <h2>Special Outputs Activity</h2>
                    <Modal icon="info" data={graphMessages.specialOutputsActivity} />
                </div>
                <div className="row statistics-row ">
                    <StackedBarChart
                        chartId={ids.next().value}
                        title="Daily Account Activity"
                        info={graphMessages.dailyAccountActivity}
                        subgroups={["created", "transferred", "destroyed"]}
                        groupLabels={["Created", "Transferred", "Destroyed"]}
                        colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                        data={accountActivityDaily}
                    />
                    <StackedBarChart
                        chartId={ids.next().value}
                        title="Daily Anchor Activity"
                        info={graphMessages.dailyAnchorActivity}
                        subgroups={["created", "governorChanged", "stateChanged", "destroyed"]}
                        groupLabels={["Created", "Governor changed", "State changed", "Destroyed"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                        data={anchorActivityDaily}
                    />
                </div>
                <div className="row statistics-row">
                    <StackedBarChart
                        chartId={ids.next().value}
                        title="Daily NFT Activity"
                        info={graphMessages.dailyNftActivity}
                        subgroups={["created", "transferred", "destroyed"]}
                        groupLabels={["Created", "Transferred", "Destroyed"]}
                        colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                        data={nftActivityDaily}
                    />
                    <StackedBarChart
                        chartId={ids.next().value}
                        title="Daily Foundry Activity"
                        info={graphMessages.dailyFoundryActivity}
                        subgroups={["created", "transferred", "destroyed"]}
                        groupLabels={["Created", "Transferred", "Destroyed"]}
                        colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                        data={foundryActivityDaily}
                    />
                </div>
                <div className="row statistics-row">
                    <StackedBarChart
                        chartId={ids.next().value}
                        title="Daily Delegation Activity"
                        info={graphMessages.dailyDelegationActivity}
                        subgroups={["created", "transferred", "destroyed"]}
                        groupLabels={["Created", "Transferred", "Destroyed"]}
                        colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                        data={delegationActivityDaily}
                    />
                </div>
            </div>
        </div>
    );
};
