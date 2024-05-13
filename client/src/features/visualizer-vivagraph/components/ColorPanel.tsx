import React, { memo } from "react";

const ColorPanel = ({ label, color }: { label: string; color: string | string[] }): React.JSX.Element => (
    <div className="key-panel-item">
        {Array.isArray(color) ? (
            <div className="key-panel-item-multi-color">
                {color.map((c, index) => (
                    <div
                        key={`${label}-${index}`}
                        className="key-marker"
                        style={{
                            backgroundColor: c,
                        }}
                    />
                ))}
            </div>
        ) : (
            <div
                className="key-marker"
                style={{
                    backgroundColor: color,
                }}
            />
        )}
        <div className="key-label">{label}</div>
    </div>
);

export default memo(ColorPanel);
