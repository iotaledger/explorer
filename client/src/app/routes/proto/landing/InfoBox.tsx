import React from "react";
import { NumberHelper } from "../../../../helpers/numberHelper";
import "./InfoBox.scss";

interface InfoBoxProps {
    itemsPerSecond: string;
    confirmedItemsPerSecondPercent: string;
    confirmationLatency: number;
}

const InfoBox: React.FC<InfoBoxProps> = (
    { itemsPerSecond, confirmedItemsPerSecondPercent, confirmationLatency }
) => (
    <div className="main-info-boxes">
        <div className="info-box">
            <span className="info-box--title">Conf. Latency</span>
            <span className="info-box--value">
                {confirmationLatency}s
            </span>
        </div>
        <div className="info-box">
            <span className="info-box--title">Blocks Per Sec
            </span>
            <div className="info-box--value">
                <span className="download-rate">
                    {NumberHelper.roundTo(Number(itemsPerSecond), 1) || "--"}
                </span>
            </div>
        </div>
        <div className="info-box">
            <span className="info-box--title">Inclusion Rate</span>
            <span className="info-box--value">
                {confirmedItemsPerSecondPercent}
            </span>
        </div>
    </div>
);

export default InfoBox;
