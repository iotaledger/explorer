import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import graphMessages from "../../../../assets/modals/stardust/statistics/graphs.json";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import {
    DataPoint, IStatisticsGraphsData, mapDailyStatsToGraphsData
} from "../../../../helpers/stardust/statisticsUtils";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IAnalyticStats } from "../../../../models/api/stats/IAnalyticStats";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../../services/stardust/stardustTangleCacheService";
import Modal from "../../../components/Modal";
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
        cacheService.influxStatisticsData(network).then(response => {
            if (!response.error && response.influxStats) {
                const graphsData: IStatisticsGraphsData = mapDailyStatsToGraphsData(response.influxStats);

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
        Number(analyticStats?.lockedStorageDeposit),
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
                                <Modal icon="info" data={graphMessages.blocks} />
                            </div>
                            <div className="row statistics-row">
                                <StackedBarChart
                                    title="Daily Blocks"
                                    info={graphMessages.dailyBlocks}
                                    subgroups={["transaction", "milestone", "taggedData", "noPayload"]}
                                    groupLabels={["Transaction", "Milestone", "Tagged Data", "No payload"]}
                                    colors={["#7AFFF2", "#00E0CA", "#36A1AC", "#186575"]}
                                    data={dailyBlocks}
                                />
                                <StackedBarChart
                                    title="Daily Transactions"
                                    info={graphMessages.dailyTransactions}
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
                                <Modal icon="info" data={graphMessages.outputs} />
                            </div>
                            <div className="row statistics-row">
                                <StackedLineChart
                                    title="Total Outputs by Type"
                                    info={graphMessages.totalOutputs}
                                    subgroups={["basic", "alias", "foundry", "nft"]}
                                    groupLabels={["Basic", "Alias", "Foundry", "Nft"]}
                                    colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                                    data={outputs}
                                />
                                <StackedLineChart
                                    title="Total Tokens by Output Type"
                                    info={graphMessages.totalTokens}
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
                                <Modal icon="info" data={graphMessages.addressesAndTokens} />
                            </div>
                            <div className="row info-panel">
                                <ChartInfoPanel
                                    label="Native tokens minted"
                                    value={analyticStats?.nativeTokens ?? "-"}
                                />
                                <ChartInfoPanel
                                    label="NFTs minted"
                                    value={analyticStats?.nfts ?? "-"}
                                />
                                <ChartInfoPanel
                                    label="Locked storage deposit"
                                    value={lockedStorageDepositValue}
                                />
                            </div>
                            <div className="row statistics-row margin-b-s">
                                <LineChart
                                    title="Total Addresses with Tokens"
                                    info={graphMessages.totalAddressesWithTokens}
                                    label="Addresses"
                                    color="#00F5DD"
                                    data={addressesWithBalance}
                                />
                                <LineChart
                                    title="Daily Active Addresses"
                                    info={graphMessages.dailyActiveAddresses}
                                    label="Addresses"
                                    color="#00F5DD"
                                    data={activeAddresses}
                                />
                            </div>
                            <div className="row statistics-row">
                                <BarChart
                                    title="Daily Sent Tokens"
                                    info={graphMessages.dailySentTokens}
                                    color="#00E0CA"
                                    label="Tokens"
                                    data={tokensTransferred}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Special Outputs Activity</h2>
                                <Modal icon="info" data={graphMessages.specialOutputsActivity} />
                            </div>
                            <div className="row statistics-row">
                                <StackedBarChart
                                    title="Daily Alias Activity"
                                    info={graphMessages.dailyAliasActivity}
                                    subgroups={["created", "governorChanged", "stateChanged", "destroyed"]}
                                    groupLabels={["Created", "Governor changed", "State changed", "Destroyed"]}
                                    colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                                    data={aliasActivity}
                                />
                                <StackedBarChart
                                    title="Daily NFT Activity"
                                    info={graphMessages.dailyNftActivity}
                                    subgroups={["created", "transferred", "destroyed"]}
                                    groupLabels={["Created", "Transferred", "Destroyed"]}
                                    colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                                    data={nftActivity}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Unlock Conditions</h2>
                                <Modal icon="info" data={graphMessages.unlockConditions} />
                            </div>
                            <div className="row statistics-row margin-b-s">
                                <StackedLineChart
                                    title="Total Unlock Conditions"
                                    info={graphMessages.totalUnlockConditions}
                                    subgroups={["timelock", "storageDepositReturn", "expiration"]}
                                    groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                                    colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                                    data={unlockConditionsPerType}
                                />
                            </div>
                            <div className="row statistics-row">
                                <StackedLineChart
                                    title="Total Locked Tokens"
                                    info={graphMessages.totalLockedTokens}
                                    subgroups={["timelock", "storageDepositReturn", "expiration"]}
                                    groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                                    colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                                    data={tokensHeldWithUnlockCondition}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Genesis</h2>
                                <Modal icon="info" data={graphMessages.genesis} />
                            </div>
                            <div className="row statistics-row">
                                <LineChart
                                    title="Total Unclaimed Tokens"
                                    info={graphMessages.totalUnclaimedTokens}
                                    label="Unclaimed Tokens"
                                    color="#00F5DD"
                                    data={unclaimedTokens}
                                />
                                <LineChart
                                    title="Total Unclaimed Outputs"
                                    info={graphMessages.totalUnclaimedOutputs}
                                    label="Outputs"
                                    color="#00F5DD"
                                    data={unclaimedGenesisOutputs}
                                />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header">
                                <h2>Data Storage</h2>
                                <Modal icon="info" data={graphMessages.dataStorage} />
                            </div>
                            <div className="row statistics-row">
                                <StackedBarChart
                                    title="Total Ledger Size"
                                    info={graphMessages.totalLedgerSize}
                                    subgroups={["keyBytes", "dataBytes"]}
                                    groupLabels={["Key bytes", "Data bytes"]}
                                    colors={["#00E0CA", "#36A1AC"]}
                                    data={ledgerSize}
                                />
                                <LineChart
                                    title="Total Storage Deposit"
                                    info={graphMessages.totalStorageDeposit}
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
