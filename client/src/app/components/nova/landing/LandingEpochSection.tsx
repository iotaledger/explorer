import moment from "moment";
import React from "react";
import { useEpochProgress } from "~/helpers/nova/hooks/useEpochProgress";
import { useValidatorStats } from "~/helpers/nova/hooks/useValidatorStats";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { ProgressBarSize } from "~/app/lib/ui/enums";
import { IStatDisplay } from "~/app/lib/interfaces";
import RightHalfArrow from "~assets/right-half-arrow.svg?react";
import ArrowUp from "~assets/arrow_up.svg?react";
import ProgressBar from "./ProgressBar";
import StatDisplay from "../../StatDisplay";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import "./LandingEpochSection.scss";

const EPOCH_DATE_FORMAT = "DD MMM YYYY HH:mm:ss";

const LandingEpochSection: React.FC = () => {
    const { name: network, tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { epochIndex, epochUnixTimeRange, epochProgressPercent, registrationTime } = useEpochProgress();
    const { validatorStats } = useValidatorStats();
    const { committeeValidators, committeeValidatorsPoolStake, totalCommitteeStake } = validatorStats ?? {};

    const commiiteeDelegatorStake =
        committeeValidatorsPoolStake === undefined || totalCommitteeStake === undefined
            ? "0"
            : (BigInt(committeeValidatorsPoolStake) - BigInt(totalCommitteeStake)).toString();

    if (epochIndex === null || epochProgressPercent === null) {
        return null;
    }

    let epochTimeRemaining = "-";
    let epochFrom: string = "-";
    let epochTo: string = "-";

    function getTimeRemaining(endTime: number) {
        const unixEndTime = moment.unix(endTime);
        const diffToEnd = unixEndTime.diff(moment());
        const duration = moment.duration(diffToEnd);

        // Extract hours, minutes, and seconds from the duration
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        const timeRemaining = `${hours}h : ${minutes}m : ${seconds}s`;
        return timeRemaining;
    }

    if (epochUnixTimeRange && registrationTime) {
        const epochStartTime = moment.unix(epochUnixTimeRange.from);
        const epochEndTime = moment.unix(epochUnixTimeRange.to - 1);
        epochFrom = epochStartTime.format(EPOCH_DATE_FORMAT);
        epochTo = epochEndTime.format(EPOCH_DATE_FORMAT);
        epochTimeRemaining = getTimeRemaining(epochUnixTimeRange.to - 1);
    }

    const stats: IStatDisplay[] = [
        {
            title: `${committeeValidators ?? "--"}`,
            subtitle: "Validators",
        },
        {
            title: `${totalCommitteeStake !== undefined ? formatAmount(totalCommitteeStake, tokenInfo) : "--"}`,
            subtitle: "Staked in committee",
        },
        {
            title: `${commiiteeDelegatorStake !== undefined ? formatAmount(commiiteeDelegatorStake, tokenInfo) : "--"}`,
            subtitle: "Delegated in committee",
        },
        {
            title: Math.min(Math.max(epochProgressPercent, 0), 100) + "%",
            subtitle: "Progress",
        },
    ];

    return (
        <div className="epoch-section">
            <div className="current-epoch-wrapper">
                <h3 className="epoch-section__header">Current Epoch: {epochIndex}</h3>
                <div className="epoch-progress">
                    <div className="epoch-duration">
                        <div className="epoch-block">{epochFrom}</div>
                        <RightHalfArrow id="to-arrow" />
                        <div className="epoch-block">{epochTo}</div>
                    </div>

                    <div className="time-remaining">
                        <p>Time remaining</p>
                        <span className="time">{epochTimeRemaining}</span>
                    </div>
                </div>

                <div className="epoch-progress__wrapper">
                    <ProgressBar progress={epochProgressPercent} size={ProgressBarSize.Small} />
                </div>

                <div className="epoch-progress__stats-wrapper">
                    {stats.map((stat, index) => (
                        <StatDisplay {...stat} key={index} />
                    ))}
                </div>
            </div>

            <div className="epoch-section__controls">
                <a href={epochIndex > 0 ? `/${network}/epoch/${epochIndex - 1}` : undefined} target="_blank" rel="noopener noreferrer">
                    <button className="icon-button" disabled={epochIndex === 0}>
                        <span className="epoch-section__previous">
                            <ArrowUp width={20} height={20} />
                        </span>
                    </button>
                </a>

                <div className="epoch-section__center-buttons">
                    <a href={`/${network}/epoch/${epochIndex}`} target="_blank" rel="noopener noreferrer">
                        <button className="nova">Current Epoch</button>
                    </a>
                </div>

                <a href={`/${network}/epoch/${epochIndex + 1}`} target="_blank" rel="noopener noreferrer">
                    <button className="icon-button">
                        <span className="epoch-section__next">
                            <ArrowUp width={20} height={20} fill="red" />
                        </span>
                    </button>
                </a>
            </div>
        </div>
    );
};

export default LandingEpochSection;
