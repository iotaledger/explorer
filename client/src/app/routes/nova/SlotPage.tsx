import React from "react";
import useSlotDetails from "~/helpers/nova/hooks/useSlotDetails";
import useSlotsFeed from "~/helpers/nova/hooks/useSlotsFeed";
import PageDataRow, { IPageDataRow } from "~/app/components/nova/PageDataRow";
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

export default function SlotPage({
    match: {
        params: { network, slotIndex },
    },
}: RouteComponentProps<{
    network: string;
    slotIndex: string;
}>): React.JSX.Element {
    const { latestSlotCommitments = [] } = useSlotsFeed();
    const { slotIndexToUnixTimeRange } = useNovaTimeConvert();
    const { slotCommitment: slotCommitmentDetails, slotCommitmentId } = useSlotDetails(network, slotIndex);
    const { slotManaBurned } = useSlotManaBurned(slotIndex);
    const [slotStats] = useSlotStats(slotIndex);

    const parsedSlotIndex = parseSlotIndexFromParams(slotIndex);
    const slotStatus = getSlotStatusFromLatestSlotCommitments(parsedSlotIndex, latestSlotCommitments);
    const slotFromSlotCommitments = latestSlotCommitments.find((slot) => slot.slotCommitment.slot === parsedSlotIndex);
    const slotTimeRange = parsedSlotIndex && slotIndexToUnixTimeRange ? slotIndexToUnixTimeRange(parsedSlotIndex) : null;
    const slotTimestamp = getSlotTimestamp(slotTimeRange);

    const dataRows: IPageDataRow[] = [
        {
            label: "Slot Index",
            value: parsedSlotIndex ?? "-",
        },
        {
            label: "Commitment Id",
            value: slotCommitmentId ?? "-",
        },
        { label: "Timestamp", value: slotTimestamp ?? "-" },
        {
            label: "RMC",
            value:
                slotFromSlotCommitments?.slotCommitment?.referenceManaCost?.toString() ??
                slotCommitmentDetails?.referenceManaCost?.toString() ??
                "-",
        },
        { label: "Mana burned", value: slotManaBurned?.manaBurned ?? "-" },
        { label: "Blocks", value: slotStats?.blockCount ?? "0" },
        { label: "Transactions", value: slotStats?.perPayloadType?.transaction ?? "0" },
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
                            {dataRows.map((dataRow, index) => {
                                if (dataRow.value !== undefined || dataRow.truncatedId) {
                                    return <PageDataRow key={index} {...dataRow} />;
                                }
                            })}
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
