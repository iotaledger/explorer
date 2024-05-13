import React from "react";
import "./ProgressBar.scss";
import classNames from "classnames";

enum ProgressBarSize {
    Small = "small",
    Large = "large",
}
interface ProgressBarProps {
    progress: number;
    size?: ProgressBarSize;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, size = ProgressBarSize.Large }) => (
    <div className="progress-bar__wrapper">
        <div className={classNames("progress-bar", size)}>
            <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
        </div>
    </div>
);

export default ProgressBar;
