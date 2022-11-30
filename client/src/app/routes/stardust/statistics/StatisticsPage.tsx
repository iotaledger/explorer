import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import {
    DataPoint, IStatisticsGraphsData, mapDailyStatsToGraphsData
} from "../../../../helpers/stardust/statisticsUtils";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustApiClient } from "../../../../services/stardust/stardustApiClient";
import BarChart from "../../../components/stardust/statistics/BarChart";
import LineChart from "../../../components/stardust/statistics/LineChart";
import StackedBarChart from "../../../components/stardust/statistics/StackedBarChart";
import StackedLineChart from "../../../components/stardust/statistics/StackedLineChart";
import "./StatisticsPage.scss";

interface StatisticsPageProps {
    network: string;
}

const StatisticsPage: React.FC<RouteComponentProps<StatisticsPageProps>> = ({ match: { params: { network } } }) => {
    const [apiClient] = useState(
        ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`)
    );
    const [transactions, setTransactions] = useState<DataPoint[] | null>(null);
    const [dailyBlocks, setDailyBlocks] = useState<DataPoint[] | null>(null);
    const [outputs, setOutputs] = useState<DataPoint[] | null>(null);
    const [tokensHeld, setTokensHeld] = useState<DataPoint[] | null>(null);
    const [addressesWithBalance, setAddressesWithBalance] = useState<DataPoint[] | null>(null);
    const [avgAddressesPerMilestone, setAvgAddressesPerMilestone] = useState<DataPoint[] | null>(null);
    const [tokensTransferred, setTokensTransferred] = useState<DataPoint[] | null>(null);
    const [aliasActivity, setAliasActivity] = useState<DataPoint[] | null>(null);
    const [unlockConditionsPerType, setUnlockConditionsPerType] = useState<DataPoint[] | null>(null);
    const [nftActivity, setNftActivity] = useState<DataPoint[] | null>(null);
    const [tokensHeldWithUnlockCondition, setTokensHeldWithUnlockCondition] = useState<DataPoint[] | null>(null);
    const [unclaimedTokens, setUnclaimedTokens] = useState<DataPoint[] | null>(null);
    const [unclaimedGenesisOutputs, setUnclaimedGenesisOutputs] = useState<DataPoint[] | null>(null);
    const [ledgerSize, setLedgerSize] = useState<DataPoint[] | null>(null);
    const [storageDeposit, setStorageDeposit] = useState<DataPoint[] | null>(null);

    useEffect(() => {
        apiClient.influxAnalytics({ network }).then(response => {
            if (!response.error) {
                const graphsData: IStatisticsGraphsData = mapDailyStatsToGraphsData(response);

                setDailyBlocks(graphsData.blocksDaily);
                setTransactions(graphsData.transactionsDaily);
                setOutputs(graphsData.outputsDaily);
                setTokensHeld(graphsData.tokensHeldDaily);
                setAddressesWithBalance(graphsData.addressesWithBalanceDaily);
                setAvgAddressesPerMilestone(graphsData.avgAddressesPerMilestoneDaily);
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
                                        title="Blocks"
                                        width={560}
                                        height={350}
                                        subgroups={["transaction", "milestone", "taggedData", "noPayload"]}
                                        groupLabels={["Transaction", "Milestone", "Tagged Data", "No payload"]}
                                        colors={["#73bf69", "#f2cc0d", "#8ab8ff", "#ff780a"]}
                                        data={dailyBlocks}
                                    />
                                )}
                                {transactions && (
                                    <StackedBarChart
                                        title="Transaction Payload"
                                        width={560}
                                        height={350}
                                        subgroups={["confirmed", "conflicting"]}
                                        groupLabels={["Confirmed", "Conflicting"]}
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
                                        <StackedLineChart
                                            title="Number of Outputs"
                                            width={560}
                                            height={350}
                                            subgroups={["basic", "alias", "foundry", "nft"]}
                                            groupLabels={["Basic", "Alias", "Foundry", "Nft"]}
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff", "#ff780a"]}
                                            data={outputs}
                                        />
                                    )}
                                    {tokensHeld && (
                                        <StackedLineChart
                                            title="Tokens Held by Outputs"
                                            width={560}
                                            height={350}
                                            subgroups={["basic", "alias", "foundry", "nft"]}
                                            groupLabels={["Basic", "Alias", "Foundry", "Nft"]}
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
                                            title="Addresses with Balance"
                                            width={560}
                                            height={350}
                                            data={addressesWithBalance}
                                        />
                                    )}
                                    {avgAddressesPerMilestone && (
                                        <StackedLineChart
                                            title="Avarage Number of Active Addresses per Milestone"
                                            width={560}
                                            height={350}
                                            subgroups={["sending", "receiving"]}
                                            groupLabels={["Sending", "Receiving"]}
                                            colors={["#73bf69", "#f2cc0d"]}
                                            data={avgAddressesPerMilestone}
                                        />
                                    )}
                                </div>
                                <div className="row space-between">
                                    {tokensTransferred && (
                                        <BarChart
                                            title="Tokens transferred"
                                            width={560}
                                            height={350}
                                            data={tokensTransferred}
                                            label="Tokens"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="section">
                                <div className="section--header">
                                    <h2>Output Activity</h2>
                                </div>
                                <div className="row space-between">
                                    {aliasActivity && (
                                        <StackedBarChart
                                            title="Alias Activity Counts"
                                            width={560}
                                            height={350}
                                            subgroups={["created", "governorChanged", "stateChanged", "destroyed"]}
                                            groupLabels={["Created", "Governot changed", "State changed", "Destroyed"]}
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff", "#ff780a"]}
                                            data={aliasActivity}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="section">
                                <div className="section--header">
                                    <h2>Unlock Conditions</h2>
                                </div>
                                <div className="row space-between">
                                    {unlockConditionsPerType && (
                                        <StackedLineChart
                                            title="Number of Unlock Conditions by Type"
                                            width={560}
                                            height={350}
                                            subgroups={["timelock", "storageDepositReturn", "expiration"]}
                                            groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff"]}
                                            data={unlockConditionsPerType}
                                        />
                                    )}
                                    {nftActivity && (
                                        <StackedBarChart
                                            title="NFT Activity Counts"
                                            width={560}
                                            height={350}
                                            subgroups={["created", "transferred", "destroyed"]}
                                            groupLabels={["Created", "Transferred", "Destroyed"]}
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff"]}
                                            data={nftActivity}
                                        />
                                    )}
                                </div>
                                <div className="row space-between">
                                    {tokensHeldWithUnlockCondition && (
                                        <StackedLineChart
                                            title="Tokens Held by Outputs with Unlock Conditions"
                                            width={560}
                                            height={350}
                                            subgroups={["timelock", "storageDepositReturn", "expiration"]}
                                            groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff"]}
                                            data={tokensHeldWithUnlockCondition}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="section">
                                <div className="section--header">
                                    <h2>Shimmer Claiming Rewards</h2>
                                </div>
                                <div className="row space-between">
                                    {unclaimedTokens && (
                                        <LineChart
                                            title="Unclimed Tokens"
                                            width={560}
                                            height={350}
                                            data={unclaimedTokens}
                                        />
                                    )}
                                    {unclaimedGenesisOutputs && (
                                        <LineChart
                                            title="Number of Unclaimed Shimmer Genesis Outputs"
                                            width={560}
                                            height={350}
                                            data={unclaimedGenesisOutputs}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="section">
                                <div className="section--header">
                                    <h2>Byte Cost</h2>
                                </div>
                                <div className="row space-between">
                                    {ledgerSize && (
                                        <StackedBarChart
                                            title="Ledger Size"
                                            width={560}
                                            height={350}
                                            subgroups={["keyBytes", "dataBytes"]}
                                            groupLabels={["Key bytes", "Data bytes"]}
                                            colors={["#8ab8ff", "#ff780a"]}
                                            data={ledgerSize}
                                        />
                                    )}
                                    {storageDeposit && (
                                        <LineChart
                                            title="Storage Deposit"
                                            width={560}
                                            height={350}
                                            data={storageDeposit}
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

