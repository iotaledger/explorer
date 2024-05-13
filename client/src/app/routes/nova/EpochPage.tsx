import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "~assets/modals/nova/epoch/main-header.json";
import { useEpochProgress } from "~/helpers/nova/hooks/useEpochProgress";
import Modal from "~/app/components/Modal";
import NotFound from "~/app/components/NotFound";
import moment from "moment";
import useEpochCommittee from "~/helpers/nova/hooks/useEpochCommittee";
import "./EpochPage.scss";
import { useEpochStats } from "~/helpers/nova/hooks/useEpochStats";
import EpochControls from "~/app/components/nova/epoch/EpochControls";
import { useValidators } from "~/helpers/nova/hooks/useValidators";
import { getTimeRemaining } from "~/helpers/nova/novaTimeUtils";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import TableCellWrapper, { TTableData } from "~/app/components/nova/TableCell";
import { useGenerateCommitteeTable } from "~/helpers/nova/hooks/useGenerateCommitteeTable";
import { CommitteeTableHeadings } from "~/app/lib/ui/enums/CommitteeTableHeadings.enum";
import Table, { ITableRow } from "~/app/components/Table";
import { CardInfo, CardInfoProps } from "~/app/components/CardInfo";

export interface EpochPageProps {
    /**
     * The network.
     */
    network: string;

    /**
     * The epoch index.
     */
    epochIndex: string;
}

const EpochPage: React.FC<RouteComponentProps<EpochPageProps>> = ({
    match: {
        params: { network, epochIndex },
    },
}) => {
    const { tokenInfo, manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [isFormatBalance, setIsFormatBalance] = useState(false);
    const { epochUnixTimeRange, epochProgressPercent, registrationTime } = useEpochProgress(Number(epochIndex));
    const { epochUnixTimeRange: currentEpochUnixTimeRange } = useEpochProgress();
    const { epochCommittee } = useEpochCommittee(network, epochIndex);
    const [epochStats] = useEpochStats(epochIndex);
    const { validators: candidates } = useValidators();

    if (
        epochIndex === null ||
        !epochUnixTimeRange ||
        !currentEpochUnixTimeRange ||
        epochUnixTimeRange.from >= currentEpochUnixTimeRange.to + (epochUnixTimeRange.to - epochUnixTimeRange.from)
    ) {
        return <NotFound query={epochIndex} searchTarget="epoch" />;
    }

    let registrationTimeRemaining = "???";
    let epochTimeRemaining = "???";
    let epochFrom = "???";
    let epochTo = "???";
    let futureEpochStartsIn = "???";

    const isFutureEpoch = epochUnixTimeRange.to > currentEpochUnixTimeRange.to;
    const validators = isFutureEpoch
        ? candidates?.map((candidate) => candidate.validator).filter((validator) => validator.active)
        : epochCommittee?.committee;

    const tableData: ITableRow<TTableData>[] = useGenerateCommitteeTable(validators ?? [], network, tokenInfo, manaInfo);
    const tableHeadings = Object.values(CommitteeTableHeadings);

    const epochStartTime = moment.unix(epochUnixTimeRange.from);
    const epochEndTime = moment.unix(epochUnixTimeRange.to - 1);

    if (registrationTime) {
        epochFrom = epochStartTime.format("DD MMM HH:mm:ss");
        epochTo = epochEndTime.format("DD MMM HH:mm:ss");

        const diffToEpochEnd = epochEndTime.diff(moment());
        epochTimeRemaining = diffToEpochEnd > 0 ? getTimeRemaining(epochUnixTimeRange.to - 1) : "Finished";

        registrationTimeRemaining = moment.unix(registrationTime).fromNow();
    }

    if (isFutureEpoch) {
        futureEpochStartsIn = getTimeRemaining(epochUnixTimeRange.from);
        epochFrom = epochStartTime.format("DD MMM YYYY HH:mm:ss");
        epochTo = epochEndTime.format("DD MMM YYYY HH:mm:ss");
    }

    const defaultData: CardInfoProps[] = [
        { title: "From", value: epochFrom },
        { title: "To", value: epochTo },
        { title: "Time remaining:", value: isFutureEpoch ? "Not started" : epochTimeRemaining },
        { title: "Progress", value: isFutureEpoch ? "0%" : `${epochProgressPercent}%` },
        { title: "Registration end", value: isFutureEpoch ? "-" : registrationTimeRemaining },
    ];

    const delegatedStake = Number(epochCommittee?.totalStake ?? 0) - Number(epochCommittee?.totalValidatorStake ?? 0);
    const epochData: CardInfoProps[] = [
        {
            title: "Total pool stake:",
            value: formatAmount(epochCommittee?.totalStake ?? 0, tokenInfo, isFormatBalance),
            onClickValue: () => setIsFormatBalance(!isFormatBalance),
            copyValue: epochCommittee?.totalStake ? String(epochCommittee?.totalStake) : undefined,
        },
        {
            title: "Total validator stake",
            value: formatAmount(epochCommittee?.totalValidatorStake ?? 0, tokenInfo, isFormatBalance),
            onClickValue: () => setIsFormatBalance(!isFormatBalance),
            copyValue: epochCommittee?.totalValidatorStake ? String(epochCommittee?.totalValidatorStake) : undefined,
        },
        {
            title: "Total delegated stake",
            value: formatAmount(delegatedStake, tokenInfo, isFormatBalance),
            onClickValue: () => setIsFormatBalance(!isFormatBalance),
            copyValue: String(delegatedStake),
        },
        { title: "Blocks", value: epochStats?.blockCount ?? "0" },
        { title: "Transactions", value: epochStats?.perPayloadType?.transaction ?? "0" },
    ];

    return (
        <section className="epoch-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="epoch-page--header space-between">
                        <div className="header--title row middle">
                            <h1>Epoch {epochIndex}</h1>
                            <Modal icon="info" data={mainHeaderMessage} />
                        </div>
                        <EpochControls epochIndex={Number(epochIndex)} isFutureEpoch={isFutureEpoch} />
                    </div>
                    <div className="section">
                        <div className="section--header row row--tablet-responsive middle space-between">
                            <div className="row middle">
                                <h2>General</h2>
                            </div>
                        </div>
                        <div className="card-info-wrapper">
                            {defaultData.map((data, index) => {
                                return <CardInfo key={index} title={data.title} value={data.value} onClickValue={data.onClickValue} />;
                            })}

                            {!isFutureEpoch &&
                                epochData.map((data, index) => {
                                    return (
                                        <CardInfo
                                            key={index}
                                            title={data.title}
                                            value={data.value}
                                            onClickValue={data.onClickValue}
                                            copyValue={data.copyValue}
                                        />
                                    );
                                })}

                            {isFutureEpoch && <CardInfo title="Starts in:" value={futureEpochStartsIn} />}
                        </div>
                    </div>
                    <div className="section section--committee">
                        <div className="section--header row row--tablet-responsive middle space-between">
                            <div className="row middle">
                                <h2>{isFutureEpoch ? "Candidates" : "Committee"}</h2>
                            </div>
                        </div>
                        <div className="section--data">
                            <Table headings={tableHeadings} data={tableData} TableDataComponent={TableCellWrapper} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EpochPage;
