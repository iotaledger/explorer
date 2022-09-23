import React from "react";
import { NumberHelper } from "../../../../helpers/numberHelper";
import "./InfoBox.scss";

interface InfoBoxProps {
    itemsPerSecond: string;
    confirmedItemsPerSecondPercent: string;
    marketCapCurrency: string;
    priceCurrency: string;
    isShimmer: boolean;
    showMarket: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = (
    { itemsPerSecond, confirmedItemsPerSecondPercent, marketCapCurrency, priceCurrency, isShimmer, showMarket }
) => (
    <div className="main-info-boxes">
        <div className="info-box">
            <span className="info-box--title">Blocks per sec
            </span>
            <div className="info-box--value">
                <span className="download-rate">
                    {NumberHelper.roundTo(Number(itemsPerSecond), 1) || "--"}
                </span>
            </div>
        </div>
        <div className="info-box">
            <span className="info-box--title">Inclusion rate</span>
            <span className="info-box--value">
                {confirmedItemsPerSecondPercent}
            </span>
        </div>
        {!isShimmer && showMarket && (
            <div className="info-box">
                <span className="info-box--title">IOTA Market Cap</span>
                <span className="info-box--value">{marketCapCurrency}</span>
            </div>
        )}
        {!isShimmer && showMarket && (
            <div className="info-box">
                <span className="info-box--title">Price / MI</span>
                <span className="info-box--value">
                    {priceCurrency}
                </span>
            </div>
        )}
    </div>
);

export default InfoBox;
