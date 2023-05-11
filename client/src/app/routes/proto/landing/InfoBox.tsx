import React from "react";
import { NumberHelper } from "../../../../helpers/numberHelper";
import "./InfoBox.scss";

interface InfoBoxProps {
    bps: number;
    inclusionRate: string;
    confLatency: string;
}

const InfoBox: React.FC<InfoBoxProps> = (
    { bps, inclusionRate, confLatency }
) => (
    <div className="main-info-boxes">
        <div className="info-box">
            <span className="info-box--title">Conf. Latency</span>
            <span className="info-box--value">
                {confLatency}
            </span>
        </div>
        <div className="info-box">
            <span className="info-box--title">Blocks Per Sec
            </span>
            <div className="info-box--value">
                <span className="download-rate">
                    {NumberHelper.roundTo(Number(bps), 1)}
                </span>
            </div>
        </div>
        <div className="info-box">
            <span className="info-box--title">Inclusion Rate</span>
            <span className="info-box--value">
                {inclusionRate}
            </span>
        </div>
    </div>
);

export default InfoBox;
