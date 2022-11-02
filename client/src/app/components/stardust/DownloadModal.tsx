import React, { useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustApiClient } from "../../../services/stardust/stardustApiClient";
import Spinner from "../Spinner";
import "./DownloadModal.scss";

interface DownloadModalProps {
    network: string;
    address: string;
}

type TimespanOption = "one" | "six" | "year" | "all";

const DownloadModal: React.FC<DownloadModalProps> = ({ network, address }) => {
    const [apiClient] = useState(
        ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`)
    );
    const [showModal, setShowModal] = useState(false);
    const [timespan, setTimespan] = useState<TimespanOption | null>(null);
    const [jobStatus, setJobStatus] = useState(PromiseStatus.PENDING);

    const onTimespanSelect = (value: TimespanOption) => {
        setTimespan(value);
    };

    const onModalToggle = (value: boolean) => {
        setTimespan(null);
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
        if (timespan) {
            const downloadMonitor = new PromiseMonitor(status => {
                setJobStatus(status);
            });

            // eslint-disable-next-line no-void
            void downloadMonitor.enqueue(
                async () => apiClient.transactionHistoryDownload(network, address, timespan).then(response => {
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
                            <div className="select-container">
                                <select
                                    className="period-select"
                                    defaultValue="none"
                                    onChange={({ target: { value } }) => onTimespanSelect(value as TimespanOption)}
                                >
                                    <option value="none" disabled>Select a time span</option>
                                    <option value="one">Last month</option>
                                    <option value="six">Last six months</option>
                                    <option value="year">Last year</option>
                                    <option value="all">Everything</option>
                                </select>
                            </div>
                            {!isDownloading ? (
                                <button
                                    className="confirm-button"
                                    type="button"
                                    disabled={timespan === null}
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

