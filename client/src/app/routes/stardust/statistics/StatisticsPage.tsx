import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import {
    DataPoint, IStatisticsGraphsData, mapDailyStatsToGraphsData
} from "../../../../helpers/stardust/statisticsUtils";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IAnalyticStats } from "../../../../models/api/stats/IAnalyticStats";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../../services/stardust/stardustTangleCacheService";
import ChartInfoPanel from "../../../components/stardust/statistics/ChartInfoPanel";
import BarChart from "../../../components/stardust/statistics/charts/BarChart";
import LineChart from "../../../components/stardust/statistics/charts/LineChart";
import StackedBarChart from "../../../components/stardust/statistics/charts/StackedBarChart";
import StackedLineChart from "../../../components/stardust/statistics/charts/StackedLineChart";
import NetworkContext from "../../../context/NetworkContext";
import { COMMAS_REGEX } from "../landing/ShimmerClaimedUtils";
import "./StatisticsPage.scss";

interface StatisticsPageProps {
    network: string;
}

const StatisticsPage: React.FC<RouteComponentProps<StatisticsPageProps>> = ({ match: { params: { network } } }) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [cacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [transactions, setTransactions] = useState<DataPoint[]>([]);
    const [dailyBlocks, setDailyBlocks] = useState<DataPoint[]>([]);
    const [outputs, setOutputs] = useState<DataPoint[]>([]);
    const [tokensHeld, setTokensHeld] = useState<DataPoint[]>([]);
    const [addressesWithBalance, setAddressesWithBalance] = useState<DataPoint[]>([]);
    const [avgAddressesPerMilestone, setAvgAddressesPerMilestone] = useState<DataPoint[]>([]);
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
        cacheService.influxStatisticsData(network).then(response => {
            if (!response.error && response.influxStats) {
                const graphsData: IStatisticsGraphsData = mapDailyStatsToGraphsData(response.influxStats);

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
                console.log("Fetching influx stats failed", response.error);
            }
        }).catch(e => console.log("Influx analytics fetch failed", e));

        cacheService.chronicleAnalytics(network).then(response => {
            if (!response.error && response.analyticStats) {
                setAnalyticStats(response.analyticStats);
            } else {
                console.log("Fetching chronicle stats failed", response.error);
            }
        }).catch(e => console.log("Chronicle analytics fetch failed", e));
    }, []);

    const lockedStorageDepositValue = formatAmount(
        Number(analyticStats?.lockedStorageDeposit?.totalByteCost),
        tokenInfo
    ).replace(COMMAS_REGEX, ",") ?? "-";

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
                            <div className="row statistics-row">
                                <StackedBarChart
                                    title="Blocks"
                                    subgroups={["transaction", "milestone", "taggedData", "noPayload"]}
                                    groupLabels={["Transaction", "Milestone", "Tagged Data", "No payload"]}
                                    colors={["#7AFFF2", "#00E0CA", "#36A1AC", "#186575"]}
                                    data={dailyBlocks}
                                />
                                <StackedBarChart
                                    title="Transaction Payload"
                                    subgroups={["confirmed", "conflicting"]}
                                    groupLabels={["Confirmed", "Conflicting"]}
                                    colors={["#00E0CA", "#36A1AC"]}
                                    data={transactions}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Outputs</h2>
                            </div>
                            <div className="row statistics-row">
                                <StackedLineChart
                                    title="Number of Outputs"
                                    subgroups={["basic", "alias", "foundry", "nft"]}
                                    groupLabels={["Basic", "Alias", "Foundry", "Nft"]}
                                    colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                                    data={outputs}
                                />
                                <StackedLineChart
                                    title="Tokens Held by Outputs"
                                    subgroups={["basic", "alias", "foundry", "nft"]}
                                    groupLabels={["Basic", "Alias", "Foundry", "Nft"]}
                                    colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                                    data={tokensHeld}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Addresses and Tokens</h2>
                            </div>
                            <div className="row info-panel">
                                <ChartInfoPanel
                                    label="Native tokens minted"
                                    value={analyticStats?.nativeTokens?.count ?? "-"}
                                />
                                <ChartInfoPanel
                                    label="NFTs minted"
                                    value={analyticStats?.nfts?.count ?? "-"}
                                />
                                <ChartInfoPanel
                                    label="Locked storage deposit"
                                    value={lockedStorageDepositValue}
                                />
                            </div>
                            <div className="row statistics-row margin-b-s">
                                <LineChart
                                    title="Addresses with Balance"
                                    label="Addresses"
                                    color="#00F5DD"
                                    data={addressesWithBalance}
                                />
                                <StackedLineChart
                                    title="Avg. Number of Active Addresses per Milestone"
                                    subgroups={["sending", "receiving"]}
                                    groupLabels={["Sending", "Receiving"]}
                                    colors={["#4140DF", "#36A1AC"]}
                                    data={avgAddressesPerMilestone}
                                />
                            </div>
                            <div className="row statistics-row">
                                <BarChart
                                    title="Tokens transferred"
                                    color="#00E0CA"
                                    label="Tokens"
                                    data={tokensTransferred}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Output Activity</h2>
                            </div>
                            <div className="row statistics-row">
                                <StackedBarChart
                                    title="Alias Activity Counts"
                                    subgroups={["created", "governorChanged", "stateChanged", "destroyed"]}
                                    groupLabels={["Created", "Governor changed", "State changed", "Destroyed"]}
                                    colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                                    data={aliasActivity}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Unlock Conditions</h2>
                            </div>
                            <div className="row statistics-row margin-b-s">
                                <StackedLineChart
                                    title="Number of Unlock Conditions by Type"
                                    subgroups={["timelock", "storageDepositReturn", "expiration"]}
                                    groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                                    colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                                    data={unlockConditionsPerType}
                                />
                                <StackedBarChart
                                    title="NFT Activity Counts"
                                    subgroups={["created", "transferred", "destroyed"]}
                                    groupLabels={["Created", "Transferred", "Destroyed"]}
                                    colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                                    data={nftActivity}
                                />
                            </div>
                            <div className="row statistics-row">
                                <StackedLineChart
                                    title="Tokens Held by Outputs with Unlock Conditions"
                                    subgroups={["timelock", "storageDepositReturn", "expiration"]}
                                    groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                                    colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                                    data={tokensHeldWithUnlockCondition}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Shimmer Claiming Rewards</h2>
                            </div>
                            <div className="row statistics-row">
                                <LineChart
                                    title="Unclaimed Tokens"
                                    label="Unclaimed Tokens"
                                    color="#00F5DD"
                                    data={unclaimedTokens}
                                />
                                <LineChart
                                    title="Number of Unclaimed Genesis Outputs"
                                    label="Outputs"
                                    color="#00F5DD"
                                    data={unclaimedGenesisOutputs}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Byte Cost</h2>
                            </div>
                            <div className="row statistics-row">
                                <StackedBarChart
                                    title="Ledger Size"
                                    subgroups={["keyBytes", "dataBytes"]}
                                    groupLabels={["Key bytes", "Data bytes"]}
                                    colors={["#00E0CA", "#36A1AC"]}
                                    data={ledgerSize}
                                />
                                <LineChart
                                    title="Storage Deposit"
                                    label="Storage Deposit"
                                    color="#00F5DD"
                                    data={storageDeposit}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;

