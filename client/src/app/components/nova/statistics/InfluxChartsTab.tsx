import React from "react";
import graphMessages from "~assets/modals/nova/statistics/graphs.json";
import { useChartsState } from "~helpers/nova/hooks/useChartsState";
import { idGenerator } from "~helpers/stardust/statisticsUtils";
import Modal from "../../Modal";
import StackedLineChart from "../../stardust/statistics/charts/StackedLineChart";
import LineChart from "../../stardust/statistics/charts/LineChart";
import BarChart from "../../stardust/statistics/charts/BarChart";
import StackedBarChart from "../../stardust/statistics/charts/StackedBarChart";
import ChartInfoPanel from "~/app/components/stardust/statistics/ChartInfoPanel";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

export const InfluxChartsTab: React.FC = () => {
    const { tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);

    const {
        blocksDaily,
        transactionsDaily,
        outputsDaily,
        tokensHeldDaily,
        addressesWithBalanceDaily,
        tokensTransferredDaily,
        anchorActivityDaily,
        nftActivityDaily,
        accountActivityDaily,
        foundryActivityDaily,
        delegationActivityDaily,
        unlockConditionsPerTypeDaily,
        tokensHeldWithUnlockConditionDaily,
        storageDeposit,
        manaBurnedDaily,
        analyticStats,
    } = useChartsState();

    const lockedStorageDepositValue = analyticStats?.lockedStorageDeposit
        ? formatAmount(analyticStats.lockedStorageDeposit, tokenInfo)
        : "-";

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
                        data={blocksDaily}
                    />
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Daily Transactions"
                        info={graphMessages.dailyTransactions}
                        subgroups={["finalized", "failed"]}
                        groupLabels={["Finalized", "Failed"]}
                        colors={["#00E0CA", "#36A1AC"]}
                        data={transactionsDaily}
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
                        data={outputsDaily}
                    />
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Total Tokens by Output Type"
                        info={graphMessages.totalTokens}
                        subgroups={["basic", "account", "foundry", "nft", "anchor", "delegation"]}
                        groupLabels={["Basic", "Account", "Foundry", "Nft", "Anchor", "Delegation"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#186575", "#99BEE1", "#00E0CA"]}
                        data={tokensHeldDaily}
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
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Total Addresses with Tokens"
                        info={graphMessages.totalAddressesWithTokens}
                        subgroups={["ed25519", "account", "nft", "anchor", "implicit"]}
                        groupLabels={["Ed25519", "Account", "Nft", "Anchor", "Implicit"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#186575", "#99BEE1"]}
                        data={addressesWithBalanceDaily}
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
            <div className="section">
                <div className="section--header">
                    <h2>Unlock Conditions</h2>
                    <Modal icon="info" data={graphMessages.unlockConditions} />
                </div>
                <div className="row statistics-row margin-b-s">
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Total Outputs with Special Unlock Conditions"
                        info={graphMessages.totalUnlockConditions}
                        subgroups={["timelock", "storageDepositReturn", "expiration"]}
                        groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                        colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                        data={unlockConditionsPerTypeDaily}
                    />
                </div>
                <div className="row statistics-row">
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Total Tokens with Special Unlock Conditions"
                        info={graphMessages.totalLockedTokens}
                        subgroups={["timelock", "storageDepositReturn", "expiration"]}
                        groupLabels={["Timelock", "Storage deposit return", "Expiration"]}
                        colors={["#4140DF", "#00F5DD", "#36A1AC"]}
                        data={tokensHeldWithUnlockConditionDaily}
                    />
                </div>
            </div>
            <div className="section">
                <div className="section--header">
                    <h2>Data Storage</h2>
                    <Modal icon="info" data={graphMessages.dataStorage} />
                </div>
                <div className="row statistics-row">
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
            <div className="section">
                <div className="section--header">
                    <h2>Mana</h2>
                    <Modal icon="info" data={graphMessages.dataStorage} />
                </div>
                <div className="row statistics-row">
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Mana Burned Daily"
                        info={graphMessages.manaBurned}
                        subgroups={["manaBurned", "bicBurned"]}
                        groupLabels={["Mana Burned", "Bic Burned"]}
                        colors={["#00E0CA", "#36A1AC"]}
                        data={manaBurnedDaily}
                    />
                </div>
            </div>
        </div>
    );
};
