import React from "react";
import { RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "~assets/modals/nova/epoch/main-header.json";
import { useEpochProgress } from "~/helpers/nova/hooks/useEpochProgress";
import Modal from "~/app/components/Modal";
import NotFound from "~/app/components/NotFound";
import moment from "moment";
import useEpochCommittee from "~/helpers/nova/hooks/useEpochCommittee";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import "./EpochPage.scss";
import EpochControls from "~/app/components/nova/epoch/EpochControls";

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
    const { epochUnixTimeRange, epochProgressPercent, registrationTime } = useEpochProgress(Number(epochIndex));
    const { epochCommittee } = useEpochCommittee(network, epochIndex);

    // const isCurrentEpoch = moment().isBetween(moment.unix(epochUnixTimeRange.from), moment.unix(epochUnixTimeRange.to - 1));
    // const isPreviousEpoch = moment().isBefore(moment.unix(epochUnixTimeRange.from));
    // const epochLength = epochUnixTimeRange.to - epochUnixTimeRange.from;
    // const isFutureEpoch = moment().isAfter(moment.unix(epochUnixTimeRange.to - 1));
    // const isNextEpoch = moment().isBefore(moment.unix(epochUnixTimeRange.to + epochLength));
    // const isTwoEpochsFuture = moment().isBefore(moment.unix(epochUnixTimeRange.to + epochLength * 2));

    if (epochIndex === null || !epochUnixTimeRange || moment().unix() < epochUnixTimeRange.from) {
        return <NotFound query={epochIndex} searchTarget="epoch" />;
    }

    let registrationTimeRemaining = "???";
    let epochTimeRemaining = "???";
    let epochFrom = "???";
    let epochTo = "???";

    if (registrationTime) {
        const epochStartTime = moment.unix(epochUnixTimeRange.from);
        const epochEndTime = moment.unix(epochUnixTimeRange.to - 1);
        epochFrom = epochStartTime.format("DD MMM HH:mm:ss");
        epochTo = epochEndTime.format("DD MMM HH:mm:ss");

        const diffToEpochEnd = epochEndTime.diff(moment());
        epochTimeRemaining = diffToEpochEnd > 0 ? moment(diffToEpochEnd).format("H:mm:ss") : "Finished";

        registrationTimeRemaining = moment.unix(registrationTime).fromNow();
    }

    return (
        <section className="epoch-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="epoch-page--header space-between">
                        <div className="header--title row middle">
                            <h1>Epoch {epochIndex}</h1>
                            <Modal icon="info" data={mainHeaderMessage} />
                        </div>
                        <EpochControls epochIndex={Number(epochIndex)} />
                    </div>
                    <div className="section">
                        <div className="section--header row row--tablet-responsive middle space-between">
                            <div className="row middle">
                                <h2>General</h2>
                            </div>
                        </div>
                        <div className="section--data">
                            <div className="label">From:</div>
                            <div className="value">{epochFrom}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">To:</div>
                            <div className="value">{epochTo}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Time remaining:</div>
                            <div className="value">{epochTimeRemaining}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Progress:</div>
                            <div className="value">{epochProgressPercent}%</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Registration end:</div>
                            <div className="value">{registrationTimeRemaining}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Total pool stake:</div>
                            <div className="value">{epochCommittee?.totalStake}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Total validator stake:</div>
                            <div className="value">{epochCommittee?.totalValidatorStake}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Total delegated stake:</div>
                            <div className="value">{Number(epochCommittee?.totalStake) - Number(epochCommittee?.totalValidatorStake)}</div>
                        </div>
                    </div>

                    <div className="section all-validators__section">
                        <h2 className="all-validators__header">Committee</h2>
                        <div className="all-validators__wrapper">
                            <div className="validator-item table-header">
                                <div className="validator-item__address">Address</div>
                                <div className="validator-item__fixed-cost">Cost</div>
                                <div className="validator-item__pool-stake">Pool stake</div>
                                <div className="validator-item__validator-stake">Validator stake</div>
                                <div className="validator-item__delegator-stake">Delegated stake</div>
                            </div>
                            {epochCommittee?.committee.map((validator, idx) => {
                                const delegatorStake = Number(validator.poolStake) - Number(validator.validatorStake);
                                return (
                                    <div className="validator-item" key={`validator-${idx}`}>
                                        <div className="validator-item__address">
                                            <TruncatedId id={validator.address} />
                                        </div>
                                        <div className="validator-item__fixed-cost">{validator.fixedCost}</div>
                                        <div className="validator-item__pool-stake">{validator.poolStake}</div>
                                        <div className="validator-item__validator-stake">{validator.validatorStake}</div>
                                        <div className="validator-item__delegator-stake">{delegatorStake}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EpochPage;
