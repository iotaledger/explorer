import React, { useState } from "react";
import useSlotDetails from "~/helpers/nova/hooks/useSlotDetails";
import useSlotsFeed from "~/helpers/nova/hooks/useSlotsFeed";
import Modal from "~/app/components/Modal";
import mainHeaderMessage from "~assets/modals/nova/slot/main-header.json";
import NotFound from "~/app/components/NotFound";
import { RouteComponentProps } from "react-router-dom";
import StatusPill from "~/app/components/nova/StatusPill";
import { getSlotStatusFromLatestSlotCommitments, parseSlotIndexFromParams } from "~/app/lib/utils/slot.utils";
import { SLOT_STATUS_TO_PILL_STATUS } from "~/app/lib/constants/slot.constants";
import SlotBlocksSection from "~/app/components/nova/slot/blocks/SlotBlocksSection";
import { useSlotManaBurned } from "~/helpers/nova/hooks/useSlotManaBurned";
import "./SlotPage.scss";
import { useSlotStats } from "~/helpers/nova/hooks/useSlotStats";
import { useNovaTimeConvert } from "~/helpers/nova/hooks/useNovaTimeConvert";
import moment from "moment";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { CardInfo, CardInfoProps } from "~/app/components/CardInfo";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";

const FALLBACK_STRING = "-";

export default function SlotPage({
    match: {
        params: { network, slotIndex },
    },
}: RouteComponentProps<{
    network: string;
    slotIndex: string;
}>): React.JSX.Element {
    const { manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { latestSlotCommitments = [] } = useSlotsFeed();
    const { slotIndexToUnixTimeRange, slotIndexToEpochIndex } = useNovaTimeConvert();
    const { slotCommitment: slotCommitmentDetails, slotCommitmentId } = useSlotDetails(network, slotIndex);
    const { slotManaBurned } = useSlotManaBurned(slotIndex);
    const [slotStats] = useSlotStats(slotIndex);
    const [formatManaAmounts, setFormatManaAmounts] = useState(false);

    const parsedSlotIndex = parseSlotIndexFromParams(slotIndex);
    const slotStatus = getSlotStatusFromLatestSlotCommitments(parsedSlotIndex, latestSlotCommitments);
    const slotFromSlotCommitments = latestSlotCommitments.find((slot) => slot.slotCommitment.slot === parsedSlotIndex);
    const slotTimeRange = parsedSlotIndex && slotIndexToUnixTimeRange ? slotIndexToUnixTimeRange(parsedSlotIndex) : null;
    const slotTimestamp = getSlotTimestamp(slotTimeRange);
    const epochIndex = parsedSlotIndex && slotIndexToEpochIndex ? slotIndexToEpochIndex(parsedSlotIndex) : null;

    const rmc =
        slotFromSlotCommitments?.slotCommitment?.referenceManaCost?.toString() ??
        slotCommitmentDetails?.referenceManaCost?.toString() ??
        FALLBACK_STRING;
    const manaBurned = slotManaBurned?.manaBurned ? formatAmount(slotManaBurned?.manaBurned, manaInfo, formatManaAmounts) : FALLBACK_STRING;
    const slotData: CardInfoProps[] = [
        {
            title: "Slot Index",
            value: parsedSlotIndex ?? FALLBACK_STRING,
        },
        { title: "Timestamp", value: slotTimestamp ?? FALLBACK_STRING },
        {
            title: "Epoch Index",
            value: epochIndex ?? FALLBACK_STRING,
        },
        {
            title: "RMC",
            value: formatAmount(rmc, manaInfo, formatManaAmounts),
            onClickValue: () => setFormatManaAmounts(!formatManaAmounts),
            copyValue: rmc !== FALLBACK_STRING ? String(rmc) : undefined,
        },
        {
            title: "Mana burned",
            value: manaBurned,
            onClickValue: () => setFormatManaAmounts(!formatManaAmounts),
            copyValue: slotManaBurned?.manaBurned ? String(slotManaBurned?.manaBurned) : undefined,
        },
        { title: "Blocks", value: slotStats?.blockCount ?? "0" },
        { title: "Transactions", value: slotStats?.perPayloadType?.transaction ?? "0" },
    ];

    return (
        <section className="slot-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="slot-page--header">
                        <div className="header--title row middle">
                            <h1>Slot</h1>
                            <Modal icon="info" data={mainHeaderMessage} />
                        </div>
                        {parsedSlotIndex && <StatusPill label={slotStatus} status={SLOT_STATUS_TO_PILL_STATUS[slotStatus]} />}
                    </div>
                    {parsedSlotIndex ? (
                        <div className="section">
                            <div className="section--header row row--tablet-responsive middle space-between">
                                <div className="row middle">
                                    <h2>General</h2>
                                </div>
                            </div>
                            <div className="section--data">
                                <div className="label">Commitment Id</div>
                                <div className="value code">
                                    <TruncatedId id={slotCommitmentId ?? FALLBACK_STRING} showCopyButton />
                                </div>
                            </div>
                            <div className="card-info-wrapper">
                                {slotData.map((data, index) => {
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
                            </div>
                        </div>
                    ) : (
                        <NotFound query={slotIndex} searchTarget="slot" />
                    )}

                    <SlotBlocksSection slotIndex={slotIndex} />
                </div>
            </div>
        </section>
    );

    function getSlotTimestamp(slotTimeRange: { from: number; to: number } | null): string {
        if (!slotTimeRange) {
            return "-";
        }

        const remainingTime = slotTimeRange.to - moment().unix();
        const slotTimestamp = remainingTime <= 0 ? moment.unix(slotTimeRange.to).format("DD MMM YYYY HH:mm:ss") : remainingTime + "s";

        return slotTimestamp;
    }
}
