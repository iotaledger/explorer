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

const EPOCH_TIME_FORMAT = "DD MMM YYYY";

const LandingEpochSection: React.FC = () => {
    const { tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { epochIndex, epochUnixTimeRange, epochProgressPercent, registrationTime } = useEpochProgress();
    const { validatorStats } = useValidatorStats();
    const { validatorsSize, totalActivePoolStake, totalActiveValidatorStake } = validatorStats ?? {};

    const totalActiveDelegatorStake =
        totalActivePoolStake === undefined || totalActiveValidatorStake === undefined
            ? "0"
            : (BigInt(totalActivePoolStake) - BigInt(totalActiveValidatorStake)).toString();

    if (epochIndex === null || epochProgressPercent === null) {
        return null;
    }

    let epochTimeRemaining = "-";
    let epochFrom = "-";
    let epochTo = "-";

    if (epochUnixTimeRange && registrationTime) {
        const epochStartTime = moment.unix(epochUnixTimeRange.from);
        const epochEndTime = moment.unix(epochUnixTimeRange.to - 1);
        epochFrom = epochStartTime.format(EPOCH_TIME_FORMAT);
        epochTo = epochEndTime.format(EPOCH_TIME_FORMAT);

        const diffToEpochEnd = epochEndTime.diff(moment());
        epochTimeRemaining = moment(diffToEpochEnd).format("H:mm:ss");
    }

    const stats: IStatDisplay[] = [
        {
            title: `${validatorsSize ?? "--"}`,
            subtitle: "Validators",
        },
        {
            title: `${totalActiveValidatorStake !== undefined ? formatAmount(totalActiveValidatorStake, tokenInfo) : "--"}`,
            subtitle: "Staked in active set",
        },
        {
            title: `${totalActiveDelegatorStake !== undefined ? formatAmount(totalActiveDelegatorStake, tokenInfo) : "--"}`,
            subtitle: "Delegated in active set",
        },
        {
            title: epochProgressPercent + "%",
            subtitle: "Progress",
        },
    ];

    return (
        <div className="epoch-section">
            <div className="current-epoch-wrapper">
                <h3 className="epoch-section__header">Current Epoch: {epochIndex}</h3>
                <div className="epoch-progress">
                    <div className="epoch-duration">
                        <p>{epochFrom}</p>
                        <RightHalfArrow id="to-arrow" />
                        <p>{epochTo}</p>
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
                <button className="icon-button">
                    <span className="epoch-section__previous">
                        <ArrowUp width={20} height={20} />
                    </span>
                </button>

                <div className="epoch-section__center-buttons">
                    <button className="nova">Current Epoch</button>
                </div>

                <button className="icon-button">
                    <span className="epoch-section__next">
                        <ArrowUp width={20} height={20} fill="red" />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default LandingEpochSection;
