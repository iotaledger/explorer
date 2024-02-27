import React from "react";
import useuseSlotDetails from "~/helpers/nova/hooks/useSlotDetails";
import PageDataRow, { IPageDataRow } from "~/app/components/nova/PageDataRow";
import Modal from "~/app/components/Modal";
import mainHeaderMessage from "~assets/modals/nova/slot/main-header.json";
import NotFound from "~/app/components/NotFound";
import { RouteComponentProps } from "react-router-dom";
import "./SlotPage.scss";

export default function SlotPage({
    match: {
        params: { network, slotIndex },
    },
}: RouteComponentProps<{
    network: string;
    slotIndex: string;
}>): React.JSX.Element {
    const { slotCommitment } = useuseSlotDetails(network, slotIndex);

    const parsedSlotIndex = parseSlotIndex(slotIndex);

    const dataRows: IPageDataRow[] = [
        {
            label: "Slot Index",
            value: parsedSlotIndex ?? "-",
        },
        {
            label: "RMC",
            value: slotCommitment?.referenceManaCost?.toString() ?? "-",
        },
    ];

    function parseSlotIndex(slotIndex: string): number | undefined {
        const slotIndexNum = parseInt(slotIndex, 10);
        if (isNaN(slotIndexNum)) {
            return;
        }
        return slotIndexNum;
    }

    return (
        <section className="slot-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="slot-page--header">
                        <div className="header--title row middle">
                            <h1>Slot</h1>
                            <Modal icon="info" data={mainHeaderMessage} />
                        </div>
                    </div>
                    {parsedSlotIndex ? (
                        <div className="section">
                            <div className="section--header row row--tablet-responsive middle space-between">
                                <div className="row middle">
                                    <h2>General</h2>
                                </div>
                            </div>
                            {dataRows.map((dataRow, index) => {
                                if (dataRow.value || dataRow.truncatedId) {
                                    return <PageDataRow key={index} {...dataRow} />;
                                }
                            })}
                        </div>
                    ) : (
                        <NotFound query={slotIndex} searchTarget="slot" />
                    )}
                </div>
            </div>
        </section>
    );
}
