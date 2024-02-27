import React from "react";
import useSlotsFeed from "~/helpers/nova/hooks/useSlotsFeed";
import ProgressBar from "./ProgressBar";
import { Utils } from "@iota/sdk-wasm-nova/web";
import Spinner from "../../Spinner";
import TruncatedId from "../../stardust/TruncatedId";
import "./LandingSlotSection.scss";

const LandingSlotSection: React.FC = () => {
    const { currentSlotIndex, currentSlotProgressPercent, latestSlotIndexes, latestSlotCommitments } = useSlotsFeed();

    if (currentSlotIndex === null || currentSlotProgressPercent === null) {
        return null;
    }

    return (
        <div className="slots-section">
            <h2 className="slots-section__header">Latest Slots</h2>
            <div className="slots-feed__wrapper">
                <ProgressBar progress={currentSlotProgressPercent} showLabel={false}>
                    <div className="slots-feed__item transparent basic">
                        <div className="slot__index">{currentSlotIndex}</div>
                    </div>
                </ProgressBar>
                {latestSlotIndexes?.map((slot) => {
                    const commitmentWrapper = latestSlotCommitments?.find((commitment) => commitment.slotCommitment.slot === slot) ?? null;
                    const commitmentId = !commitmentWrapper ? (
                        <Spinner compact />
                    ) : (
                        <TruncatedId id={Utils.computeSlotCommitmentId(commitmentWrapper.slotCommitment)} showCopyButton />
                    );
                    const referenceManaCost = !commitmentWrapper ? (
                        <Spinner compact />
                    ) : (
                        commitmentWrapper.slotCommitment.referenceManaCost.toString()
                    );
                    const slotStatus = !commitmentWrapper ? "pending" : commitmentWrapper.status;

                    return (
                        <div key={`slot-key-${slot}`} className="slots-feed__item">
                            <div className="slot__index">{slot}</div>
                            <div className="slot__commitment-id">{commitmentId}</div>
                            <div className="slot__rmc">{referenceManaCost}</div>
                            <div className="slot__status">{slotStatus}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LandingSlotSection;
