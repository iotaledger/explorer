import React, { useContext } from "react";
import ChartInfoPanel from "./ChartInfoPanel";
import BarChart from "./charts/BarChart";
import LineChart from "./charts/LineChart";
import StackedBarChart from "./charts/StackedBarChart";
import StackedLineChart from "./charts/StackedLineChart";
import graphMessages from "~assets/modals/stardust/statistics/graphs.json";
import { useChartsState } from "~helpers/stardust/hooks/useChartsState";
import { idGenerator } from "~helpers/stardust/statisticsUtils";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "../../../context/NetworkContext";
import { COMMAS_REGEX } from "../../../routes/stardust/landing/ShimmerClaimedUtils";
import { SHIMMER } from "~/models/config/networkType";
import Modal from "../../Modal";

export const InfluxChartsTab: React.FC = () => {
    const { name: networkName, tokenInfo } = useContext(NetworkContext);

    const [
        transactions,
        dailyBlocks,
        outputs,
        tokensHeld,
        addressesWithBalance,
        activeAddresses,
        tokensTransferred,
        aliasActivity,
        unlockConditionsPerType,
        nftActivity,
        tokensHeldWithUnlockCondition,
        unclaimedTokens,
        unclaimedGenesisOutputs,
        ledgerSize,
        storageDeposit,
        analyticStats,
    ] = useChartsState();

    const lockedStorageDepositValue = analyticStats?.lockedStorageDeposit
        ? formatAmount(analyticStats.lockedStorageDeposit, tokenInfo).replace(COMMAS_REGEX, ",")
        : "-";

    const ids = idGenerator();

    const isShimmerNetwork = networkName === SHIMMER;

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
                        subgroups={["transaction", "milestone", "taggedData", "noPayload"]}
                        groupLabels={["Transaction", "Milestone", "Tagged Data", "No payload"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                        data={dailyBlocks}
                    />
                    <StackedLineChart
                        chartId={ids.next().value}
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
                        chartId={ids.next().value}
                        title="Total Outputs by Type"
                        info={graphMessages.totalOutputs}
                        subgroups={["basic", "alias", "foundry", "nft"]}
                        groupLabels={["Basic", "Alias", "Foundry", "Nft"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                        data={outputs}
                    />
                    <StackedLineChart
                        chartId={ids.next().value}
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
                    <ChartInfoPanel label="Native tokens minted" value={analyticStats?.nativeTokens ?? "-"} />
                    <ChartInfoPanel label="NFTs minted" value={analyticStats?.nfts ?? "-"} />
                    <ChartInfoPanel label="Locked storage deposit" value={lockedStorageDepositValue} />
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
                        data={activeAddresses}
                    />
                </div>
                <div className="row statistics-row">
                    <BarChart
                        chartId={ids.next().value}
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
                        chartId={ids.next().value}
                        title="Daily Alias Activity"
                        info={graphMessages.dailyAliasActivity}
                        subgroups={["created", "governorChanged", "stateChanged", "destroyed"]}
                        groupLabels={["Created", "Governor changed", "State changed", "Destroyed"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#186575"]}
                        data={aliasActivity}
                    />
                    <StackedBarChart
                        chartId={ids.next().value}
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
                        chartId={ids.next().value}
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
                        chartId={ids.next().value}
                        title="Total Locked Tokens"
                        info={graphMessages.totalLockedTokens}
                        subgroups={["timelock", "storageDepositReturn", "expiration"]}
                        groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                        colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                        data={tokensHeldWithUnlockCondition}
                    />
                </div>
            </div>
            {isShimmerNetwork && (
                <div className="section">
                    <div className="section--header">
                        <h2>Genesis</h2>
                        <Modal icon="info" data={graphMessages.genesis} />
                    </div>
                    <div className="row statistics-row">
                        <LineChart
                            chartId={ids.next().value}
                            title="Total Unclaimed Tokens"
                            info={graphMessages.totalUnclaimedTokens}
                            label="Unclaimed Tokens"
                            color="#00F5DD"
                            data={unclaimedTokens}
                        />
                        <LineChart
                            chartId={ids.next().value}
                            title="Total Unclaimed Outputs"
                            info={graphMessages.totalUnclaimedOutputs}
                            label="Outputs"
                            color="#00F5DD"
                            data={unclaimedGenesisOutputs}
                        />
                    </div>
                </div>
            )}
            <div className="section">
                <div className="section--header">
                    <h2>Data Storage</h2>
                    <Modal icon="info" data={graphMessages.dataStorage} />
                </div>
                <div className="row statistics-row">
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Total Ledger Size"
                        info={graphMessages.totalLedgerSize}
                        subgroups={["keyBytes", "dataBytes"]}
                        groupLabels={["Key bytes", "Data bytes"]}
                        colors={["#00E0CA", "#36A1AC"]}
                        data={ledgerSize}
                    />
                    <LineChart
                        chartId={ids.next().value}
                        title="Total Storage Deposit"
                        info={graphMessages.totalStorageDeposit}
                        label="Storage Deposit"
                        color="#00F5DD"
                        data={storageDeposit}
                    />
                </div>
            </div>
        </div>
    );
};
