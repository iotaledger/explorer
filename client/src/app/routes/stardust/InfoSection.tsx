import React from "react";

interface InfoSectionProps {
    visible: boolean;
}

const InfoSection: React.FC<InfoSectionProps> = ({ visible }) => (
    <div style={{ display: visible ? "grid" : "none" }} className="extended-info-boxes">
        <div className="row space-between">
            <div className="info-box">
                <span className="info-box--title">Tokens created
                </span>
                <span className="info-box--value">
                    11.2k
                </span>
            </div>
            <div className="info-box">
                <span className="info-box--title">NFTs minted</span>
                <span className="info-box--value">52.1k</span>
            </div>
            <div className="info-box">
                <span className="info-box--title">Active Addresses</span>
                <span className="info-box--value">
                    72.8k
                </span>
            </div>
        </div>
        <div className="row space-between">
            <div className="info-box">
                <span className="info-box--title">Active Addresses
                </span>
                <span className="info-box--value">
                    23.4k
                </span>
            </div>
            <div className="info-box">
                <span className="info-box--title">Locked storage deposit</span>
                <span className="info-box--value">549k SMR</span>
            </div>
            <div className="info-box">
                <span className="info-box--title">Daily transactions</span>
                <span className="info-box--value">
                    2.45m
                </span>
            </div>
        </div>
    </div>
);

export default InfoSection;
