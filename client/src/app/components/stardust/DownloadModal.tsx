import moment from "moment";
import React, { useState } from "react";
import Datetime from "react-datetime";
import { useTransactionHistoryDownload } from "~helpers/stardust/hooks/useTransactionHistoryDownload";
import Spinner from "../Spinner";
import Tooltip from "../Tooltip";
import "./DownloadModal.scss";
import "react-datetime/css/react-datetime.css";

interface DownloadModalProps {
    readonly network: string;
    readonly address: string;
}

const DOWNLOAD_INFO = "History will be downloaded from start date to present.";

const DownloadModal: React.FC<DownloadModalProps> = ({ network, address }) => {
    const [showModal, setShowModal] = useState(false);
    const [targetDate, setTargetDate] = useState<string | null>(null);
    const [date, setDate] = useState<string | null>(null);
    const [isDownloading] = useTransactionHistoryDownload(network, address, targetDate);

    const onDateSelect = (value: string) => {
        if (value) {
            setDate(value);
        } else {
            setDate(null);
        }
    };

    const onDownload = () => {
        if (date) {
            setTargetDate(date);
        } else {
            setTargetDate(null);
        }
    };

    const onModalToggle = (value: boolean) => {
        setTargetDate(null);
        setShowModal(value);
    };

    return (
        <div className="download-modal">
            <button type="button" className="modal--icon" onClick={() => onModalToggle(true)}>
                <span className="material-icons">download</span>
            </button>
            {showModal && (
                <React.Fragment>
                    <div className="modal--content">
                        <div className="modal--header">
                            <div className="modal--title">Transaction History Download</div>
                            <button type="button" onClick={() => onModalToggle(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="modal--body">
                            <div className="input-container">
                                <div className="row middle">
                                    <div className="date-label">Select start date</div>
                                    <Tooltip tooltipContent={DOWNLOAD_INFO}>
                                        <div className="modal--icon">
                                            <span className="material-icons">info</span>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className="calendar-wrapper">
                                    <span className="material-icons">calendar_month</span>
                                    <Datetime
                                        isValidDate={(current: moment.Moment) => current.isBefore(moment())}
                                        inputProps={{ placeholder: "MM/DD/YYYY" }}
                                        timeFormat={false}
                                        onChange={(value) => onDateSelect(value as string)}
                                    />
                                </div>
                            </div>
                            {isDownloading ? (
                                <button className="confirm-button" type="button" disabled={true}>
                                    <div className="spinner-container">
                                        <Spinner compact={true} />
                                    </div>
                                </button>
                            ) : (
                                <button className="confirm-button" type="button" disabled={date === null} onClick={onDownload}>
                                    Confirm
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="modal--bg" onClick={() => onModalToggle(false)} />
                </React.Fragment>
            )}
        </div>
    );
};

export default DownloadModal;
