import React from "react";
import { useCurrentEpochProgress } from "~/helpers/nova/hooks/useCurrentEpochProgress";
import "./LandingEpochSection.scss";

const LandingEpochSection: React.FC = () => {
    const { currentEpochIndex, currentEpochProgress } = useCurrentEpochProgress();

    if (currentEpochIndex === null || currentEpochProgress === null) {
        return null;
    }

    return (
        <div className="epoch-section">
            <div className="epoch-progress__wrapper">
                <h2 className="epoch-progress__header">Epoch {currentEpochIndex} Progress</h2>
                <div className="epoch-progress__stats-wrapper">
                    <div className="epoch-progress__stat">Epoch end nearing threshhold</div>
                    <div className="epoch-progress__stat">Time remaining</div>
                    <div className="epoch-progress__stat">From/To time</div>
                </div>
                <ProgressBar progress={currentEpochProgress} />
            </div>
            <div className="epoch-section__controls">
                <div className="epoch-section__button">previous</div>
                <div className="epoch-section__button">view more</div>
                <div className="epoch-section__button">next</div>
            </div>
        </div>
    );
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="progress-bar__wrapper">
        <div className="progress-bar">
            <div className="progress-bar__fill" style={{ transform: `translateX(-${100 - progress}%)` }}></div>
            <div className="progress-bar__label">{progress}%</div>
        </div>
    </div>
);

export default LandingEpochSection;
