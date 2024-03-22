import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
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
    const [selectedEpoch, setSelectedEpoch] = useState<number | undefined>(undefined);
    const [initialEpoch, setInitialEpoch] = useState<number | null>(null);
    const { tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { epochIndex, epochUnixTimeRange, epochProgressPercent, registrationTime } = useEpochProgress(selectedEpoch);
    const { validatorStats } = useValidatorStats();
    const { committeeValidators, committeeValidatorsPoolStake, totalCommitteeStake } = validatorStats ?? {};

    useEffect(() => {
        if (selectedEpoch === undefined && initialEpoch === null) {
            setInitialEpoch(epochIndex);
        }
    }, [epochIndex]);

    useEffect(() => {
        if (selectedEpoch === undefined && initialEpoch === null) {
            setInitialEpoch(epochIndex);
        }

        if (epochIndex) {
            setSelectedEpoch(epochIndex);
        }
    }, [epochIndex]);

    const onNextEpochClick = useCallback(() => {
        if (epochIndex) {
            setSelectedEpoch(epochIndex + 1);
        }
    }, [epochIndex]);

    const onPreviousEpochClick = useCallback(() => {
        if (epochIndex) {
            setSelectedEpoch(epochIndex - 1);
        }
    }, [epochIndex]);

    const onCurrentEpochClick = useCallback(() => {
        if (initialEpoch) {
            setSelectedEpoch(initialEpoch);
        }
    }, [initialEpoch]);

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
                <button className="icon-button" onClick={onPreviousEpochClick}>
                    <span className="epoch-section__previous">
                        <ArrowUp width={20} height={20} />
                    </span>
                </button>

                <div className="epoch-section__center-buttons">
                    <button className="nova" onClick={onCurrentEpochClick}>
                        Current Epoch
                    </button>
                </div>

                <button className="icon-button" onClick={onNextEpochClick}>
                    <span className="epoch-section__next">
                        <ArrowUp width={20} height={20} fill="red" />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default LandingEpochSection;
