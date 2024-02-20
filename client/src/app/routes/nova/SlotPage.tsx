import React from "react";
import Modal from "~/app/components/Modal";
import { ModalData } from "~/app/components/ModalProps";
import { RouteComponentProps } from "react-router-dom";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import classNames from "classnames";
import useSlotData from "~/helpers/nova/hooks/useSlot";
import "./SlotPage.scss";

interface SlotPageProps {
    network: string;
    slotIndex: string;
}

export default function SlotPage({
    match: {
        params: { network, slotIndex },
    },
}: RouteComponentProps<SlotPageProps>): React.JSX.Element {
    const { slotCommitment } = useSlotData(network, slotIndex);

    const message: ModalData = {
        title: "Slot Page",
        description: "<p>Slot Information here</p>",
    };

    const dataRows: IDataRow[] = [
        {
            label: "Slot Index",
            value: slotCommitment?.slot,
            highlighted: true,
        },
        {
            label: "RMC",
            value: slotCommitment?.referenceManaCost.toString(),
        },
    ];

    return (
        <section className="slot-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="slot-page--header">
                        <div className="row middle">
                            <h1>Slot</h1>
                            <Modal icon="info" data={message} />
                        </div>
                    </div>
                    <div className="section">
                        <div className="section--header row row--tablet-responsive middle space-between">
                            <div className="row middle">
                                <h2>General</h2>
                            </div>
                        </div>
                        {dataRows.map((dataRow, index) => {
                            if (dataRow.value || dataRow.truncatedId) {
                                return <DataRow key={index} {...dataRow} />;
                            }
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

interface IDataRow {
    label: string;
    value?: string | number;
    highlighted?: boolean;
    truncatedId?: {
        id: string;
        link?: string;
        showCopyButton?: boolean;
    };
}
const DataRow = ({ label, value, truncatedId, highlighted }: IDataRow) => {
    return (
        <div className="section--data">
            <div className="label">{label}</div>
            <div className={classNames("value code", { highlighted })}>
                {truncatedId ? (
                    <TruncatedId id={truncatedId.id} link={truncatedId.link} showCopyButton={truncatedId.showCopyButton} />
                ) : (
                    value
                )}
            </div>
        </div>
    );
};
