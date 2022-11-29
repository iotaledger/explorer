import moment from "moment";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustApiClient } from "../../../../services/stardust/stardustApiClient";
import BarChart from "../../../components/stardust/statistics/BarChart";
import LineChart from "../../../components/stardust/statistics/LineChart";
import StackedBarChart from "../../../components/stardust/statistics/StackedBarChart";
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
    const [aliasActivity, setAliasActivity] = useState<DataView[] | null>(null);
    const [unlockConditionsPerType, setUnlockConditionsPerType] = useState<DataView[] | null>(null);
    const [nftActivity, setNftActivity] = useState<DataView[] | null>(null);
    const [tokensHeldWithUnlockCondition, setTokensHeldWithUnlockCondition] = useState<DataView[] | null>(null);
    const [unclaimedTokens, setUnclaimedTokens] = useState<DataView[] | null>(null);
    const [unclaimedGenesisOutputs, setUnclaimedGenesisOutputs] = useState<DataView[] | null>(null);
    const [ledgerSize, setLedgerSize] = useState<DataView[] | null>(null);
    const [storageDeposit, setStorageDeposit] = useState<DataView[] | null>(null);

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
                const updateAliasActivity: DataView[] = response.aliasActivityDaily?.map(day => ({
                        time: moment(day.time).add(1, "minute").unix(),
                        created: day.created ?? 0,
                        governorChanged: day.governorChanged ?? 0,
                        stateChanged: day.stateChanged ?? 0,
                        destroyed: day.destroyed ?? 0
                })) ?? [];
                const updateUnlockConditions: DataView[] = response.unlockConditionsPerTypeDaily?.map(day => ({
                        time: moment(day.time).add(1, "minute").unix(),
                        timelock: day.timelock ?? 0,
                        storageDepositReturn: day.storageDepositReturn ?? 0,
                        expiration: day.expiration ?? 0
                })) ?? [];
                const updateNftActivity: DataView[] = response.nftActivityDaily?.map(day => ({
                        time: moment(day.time).add(1, "minute").unix(),
                        created: day.created ?? 0,
                        transferred: day.transferred ?? 0,
                        destroyed: day.destroyed ?? 0
                })) ?? [];
                const updateTokensHeldWithUc: DataView[] = response.tokensHeldWithUnlockConditionDaily?.map(day => ({
                        time: moment(day.time).add(1, "minute").unix(),
                        timelock: day.timelock ?? 0,
                        storageDepositReturn: day.storageDepositReturn ?? 0,
                        expiration: day.expiration ?? 0
                })) ?? [];
                const updateUnclaimedTokens: DataView[] = response.unclaimedTokensDaily?.map(day => ({
                        time: moment(day.time).add(1, "minute").unix(),
                        n: day.unclaimed ?? 0
                })) ?? [];
                const updateUnclaimedGenesisOutputs: DataView[] = response.unclaimedGenesisOutputsDaily?.map(day => ({
                        time: moment(day.time).add(1, "minute").unix(),
                        n: day.unclaimed ?? 0
                })) ?? [];
                const updateLedgerSize: DataView[] = response.ledgerSizeDaily?.map(day => ({
                        time: moment(day.time).add(1, "minute").unix(),
                        keyBytes: day.keyBytes ?? 0,
                        dataBytes: day.dataBytes ?? 0
                })) ?? [];
                const updateStorageDeposit: DataView[] = response.storageDepositDaily?.map(day => ({
                        time: moment(day.time).add(1, "minute").unix(),
                        n: day.storageDeposit ?? 0
                })) ?? [];

                setDailyBlocks(update);
                setTransactions(updateTransactions);
                setOutputs(updateOutputs);
                setTokensHeld(updateTokensHeld);
                setAddressesWithBalance(updateAddresses);
                setAvgAddressesPerMilestone(updateAvgAddressPerMilestone);
                setTokensTransferred(updateTokensTransferred);
                setAliasActivity(updateAliasActivity);
                setUnlockConditionsPerType(updateUnlockConditions);
                setNftActivity(updateNftActivity);
                setTokensHeldWithUnlockCondition(updateTokensHeldWithUc);
                setUnclaimedTokens(updateUnclaimedTokens);
                setUnclaimedGenesisOutputs(updateUnclaimedGenesisOutputs);
                setLedgerSize(updateLedgerSize);
                setStorageDeposit(updateStorageDeposit);
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
                                            title="Number of Outputs"
                                            width={560}
                                            height={350}
                                            subgroups={["basic", "alias", "foundry", "nft"]}
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff", "#ff780a"]}
                                            data={outputs}
                                        />
                                    )}
                                    {tokensHeld && (
                                        <StackedBarChart
                                            title="Tokens Held by Outputs"
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
                                            title="Addresses with Balance"
                                            width={560}
                                            height={350}
                                            data={addressesWithBalance}
                                        />
                                    )}
                                    {avgAddressesPerMilestone && (
                                        <StackedBarChart
                                            title="Avarage Number of Active Addresses per Milestone"
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
                                            title="Tokens transferred"
                                            width={560}
                                            height={350}
                                            data={tokensTransferred}
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
                                        <StackedBarChart
                                            title="Number of Unlock Conditions by Type"
                                            width={560}
                                            height={350}
                                            subgroups={["timelock", "storageDepositReturn", "expiration"]}
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
                                            colors={["#73bf69", "#f2cc0d", "#8ab8ff"]}
                                            data={nftActivity}
                                        />
                                    )}
                                </div>
                                <div className="row space-between">
                                    {tokensHeldWithUnlockCondition && (
                                        <StackedBarChart
                                            title="Tokens Held by Outputs with Unlock Conditions"
                                            width={560}
                                            height={350}
                                            subgroups={["timelock", "storageDepositReturn", "expiration"]}
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

