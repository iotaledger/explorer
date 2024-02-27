import React, { memo } from "react";

const ColorPanel = ({ label, color }: { label: string; color: string }): React.JSX.Element => (
    <div className="key-panel-item">
        <div
            className="key-marker"
            style={{
                backgroundColor: color,
            }}
        />
        <div className="key-label">{label}</div>
    </div>
);

export default memo(ColorPanel);
