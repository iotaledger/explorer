import moment from "moment";
import React from "react";
import { useCurrentEpochProgress } from "~/helpers/nova/hooks/useCurrentEpochProgress";
import ProgressBar from "./ProgressBar";
import "./LandingEpochSection.scss";

const LandingEpochSection: React.FC = () => {
    const { epochIndex, epochUnixTimeRange, epochProgressPercent, registrationTime } = useCurrentEpochProgress();

    if (epochIndex === null || epochProgressPercent === null) {
        return null;
    }

    let registrationTimeRemaining = "???";
    let epochTimeRemaining = "???";
    let epochFrom = "???";
    let epochTo = "???";

    if (epochUnixTimeRange && registrationTime) {
        const epochStartTime = moment.unix(epochUnixTimeRange.from);
        const epochEndTime = moment.unix(epochUnixTimeRange.to - 1);
        epochFrom = epochStartTime.format("DD MMM HH:mm:ss");
        epochTo = epochEndTime.format("DD MMM HH:mm:ss");

        const diffToEpochEnd = epochEndTime.diff(moment());
        epochTimeRemaining = moment(diffToEpochEnd).format("H:mm:ss");

        registrationTimeRemaining = moment.unix(registrationTime).fromNow();
    }

    return (
        <div className="epoch-section">
            <h2 className="epoch-section__header">Epoch {epochIndex} Progress</h2>
            <div className="epoch-progress__wrapper">
                <div className="epoch-progress__stats-wrapper">
                    <div className="epoch-progress__stat">Registration end: {registrationTimeRemaining}</div>
                    <div className="epoch-progress__stat">Time remaining: {epochTimeRemaining}</div>
                    <div className="epoch-progress__stat">
                        {epochFrom}
                        <br />
                        {epochTo}
                    </div>
                </div>
                <ProgressBar progress={epochProgressPercent} showLabel />
            </div>
            <div className="epoch-section__controls">
                <div className="epoch-section__button">previous</div>
                <div className="epoch-section__button">view more</div>
                <div className="epoch-section__button">next</div>
            </div>
        </div>
    );
};

export default LandingEpochSection;
