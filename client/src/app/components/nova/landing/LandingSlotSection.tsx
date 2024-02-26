import React from "react";
import useSlotsFeed from "~/helpers/nova/hooks/useSlotsFeed";
import "./LandingSlotSection.scss";
import ProgressBar from "./ProgressBar";

const LandingSlotSection: React.FC = () => {
    const { currentSlot, currentSlotProgressPercent, latestSlots } = useSlotsFeed();

    if (currentSlot === null || currentSlotProgressPercent === null) {
        return null;
    }

    return (
        <div className="slots-section">
            <h2 className="slots-section__header">Latest Slots</h2>
            <div className="slots-feed__wrapper">
                <ProgressBar progress={currentSlotProgressPercent} showLabel={false}>
                    <div className="slots-feed__item transparent">{currentSlot}</div>
                </ProgressBar>
                {latestSlots?.map((slot) => (
                    <div key={`slot-key-${slot}`} className="slots-feed__item">
                        {slot}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LandingSlotSection;
