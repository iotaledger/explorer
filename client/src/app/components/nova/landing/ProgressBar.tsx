import React from "react";
import "./ProgressBar.scss";

interface ProgressBarProps {
    progress: number;
    showLabel: boolean;
    children?: React.ReactNode | React.ReactElement;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showLabel, children }) => (
    <div className="progress-bar__wrapper">
        <div className="progress-bar">
            <div className="progress-bar__fill" style={{ transform: `translateX(-${100 - progress}%)` }} />
            {showLabel && <div className="progress-bar__label">{progress}%</div>}
            {children && <div className="progress-bar__children">{children}</div>}
        </div>
    </div>
);

export default ProgressBar;
