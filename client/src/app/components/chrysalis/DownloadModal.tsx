import moment from "moment";
import React, { useState } from "react";
import Datetime from "react-datetime";
import Spinner from "../Spinner";
import Tooltip from "../Tooltip";
import "react-datetime/css/react-datetime.css";
import { ServiceFactory } from "~factories/serviceFactory";
import { ChrysalisApiClient } from "~services/chrysalis/chrysalisApiClient";
import { CHRYSALIS } from "~models/config/protocolVersion";
import { triggerDownload } from "~helpers/stardust/hooks/useTransactionHistoryDownload";
import "./DownloadModal.scss";

interface DownloadModalProps {
    readonly network: string;
    readonly address: string;
}

const DOWNLOAD_INFO = "History will be downloaded from start date to present.";
const INITIAL_DATE = moment("2023-10-04");

const DownloadModal: React.FC<DownloadModalProps> = ({ network, address }) => {
    const [apiClient] = useState(ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`));
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    const [showModal, setShowModal] = useState(false);
    const [date, setDate] = useState<moment.Moment | string>(INITIAL_DATE);

    const onDownload = async () => {
        if (!date) {
            setError("Please select a date");
            return;
        }

        setIsDownloading(true);
        try {
            const response = await apiClient.transactionHistoryDownload(network, address, (date as moment.Moment).format("YYYY-MM-DD"));

            if (response.raw) {
                const responseBlob = await response.raw.blob();

                triggerDownload(responseBlob, address);
            } else if (response.error) {
                setError(response.error);
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const onModalOpen = () => {
        setShowModal(true);
    };

    const onModalClose = () => {
        setDate("");
        setShowModal(false);
    };

    return (
        <div className="download-modal">
            <button type="button" className="modal--icon" onClick={onModalOpen}>
                <span className="material-icons">download</span>
            </button>
            {showModal && (
                <React.Fragment>
                    <div className="modal--content">
                        <div className="modal--header">
                            <div className="modal--title">Transaction History Download</div>
                            <button type="button" onClick={onModalClose}>
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
                                        initialValue={INITIAL_DATE}
                                        isValidDate={(current: moment.Moment) => current.isBefore(moment("2023-10-05"))}
                                        inputProps={{ placeholder: "MM/DD/YYYY" }}
                                        timeFormat={false}
                                        onChange={(value) => setDate(value)}
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
                                <button className="confirm-button" type="button" onClick={onDownload}>
                                    Confirm
                                </button>
                            )}
                            {error && <div className="error-message">{error}</div>}
                        </div>
                    </div>
                    <div className="modal--bg" onClick={onModalClose} />
                </React.Fragment>
            )}
        </div>
    );
};

export default DownloadModal;
