import moment from "moment";
import React, { useState } from "react";
import Datetime from "react-datetime";
import { ServiceFactory } from "../../../factories/serviceFactory";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustApiClient } from "../../../services/stardust/stardustApiClient";
import Spinner from "../Spinner";
import Tooltip from "../Tooltip";
import "./DownloadModal.scss";
import "react-datetime/css/react-datetime.css";

interface DownloadModalProps {
    network: string;
    address: string;
}

const DOWNLOAD_INFO = "History will be downloaded from present date up to target date.";

const DownloadModal: React.FC<DownloadModalProps> = ({ network, address }) => {
    const [apiClient] = useState(
        ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`)
    );
    const [showModal, setShowModal] = useState(false);
    const [targetDate, setTargetDate] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState(PromiseStatus.PENDING);

    const onDateSelect = (value: string) => {
        if (value) {
            setTargetDate(value);
        } else {
            setTargetDate(null);
        }
    };

    const onModalToggle = (value: boolean) => {
        setTargetDate(null);
        setShowModal(value);
    };

    const triggerDownload = (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const filename = `txhistory-${address}.zip`;
        const tempDlElement = document.createElement("a");

        tempDlElement.href = url;
        tempDlElement.download = filename;
        document.body.append(tempDlElement);
        tempDlElement.click();
        tempDlElement.remove();
    };

    const onDownload = () => {
        if (targetDate) {
            const downloadMonitor = new PromiseMonitor(status => {
                setJobStatus(status);
            });

            // eslint-disable-next-line no-void
            void downloadMonitor.enqueue(
                async () => apiClient.transactionHistoryDownload(network, address, targetDate).then(response => {
                    if (response.raw) {
                        // eslint-disable-next-line no-void
                        void response.raw.blob().then(blob => {
                            triggerDownload(blob);
                        });
                    } else if (response.error) {
                        console.log("Problem fetching bytes for download", response.error);
                    }
                })
            );
        }
    };

    const isDownloading = jobStatus === PromiseStatus.WORKING;

    return (
        <div className="download-modal">
            <button
                type="button"
                className="modal--icon"
                onClick={() => onModalToggle(true)}
            >
                <span className="material-icons">
                    download
                </span>
            </button>
            {showModal && (
                <React.Fragment>
                    <div className="modal--content">
                        <div className="modal--header">
                            <div className="modal--title">
                                Transaction History Download
                            </div>
                            <button
                                type="button"
                                onClick={() => onModalToggle(false)}
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="modal--body">
                            <div className="input-container">
                                <div className="row middle">
                                    <div className="date-label">Select target date</div>
                                    <Tooltip tooltipContent={DOWNLOAD_INFO}>
                                        <div className="modal--icon">
                                            <span className="material-icons">
                                                info
                                            </span>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className="calendar-wrapper">
                                    <span className="material-icons">calendar_month</span>
                                    <Datetime
                                        isValidDate={(current: moment.Moment) => current.isBefore(moment())}
                                        inputProps={{ placeholder: "MM/DD/YYYY" }}
                                        timeFormat={false}
                                        onChange={value => onDateSelect(value as string)}
                                    />
                                </div>
                            </div>
                            {!isDownloading ? (
                                <button
                                    className="confirm-button"
                                    type="button"
                                    disabled={targetDate === null}
                                    onClick={onDownload}
                                >
                                    Confirm
                                </button>
                            ) : (
                                <button
                                    className="confirm-button"
                                    type="button"
                                    disabled={true}
                                >
                                    <div className="spinner-container">
                                        <Spinner compact={true} />
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                    <div
                        className="modal--bg"
                        onClick={() => onModalToggle(false)}
                    />
                </React.Fragment>
            )}
        </div>
    );
};

export default DownloadModal;

