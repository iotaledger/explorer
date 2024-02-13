import React from "react";
import { BlockState } from "@iota/sdk-wasm-nova/web";

import "./KeyPanel.scss";

export const KeyPanel: React.FC = () => {
    const statuses: {
        label: string;
        state: BlockState;
        color: string;
    }[] = [
        {
            label: "Pending",
            state: "pending",
            color: "#A6C3FC",
        },
        {
            label: "Accepted",
            state: "accepted",
            color: "#0101AB",
        },
        {
            label: "Confirmed",
            state: "confirmed",
            color: "#0000DB",
        },
        {
            label: "Finalized",
            state: "finalized",
            color: "#0101FF",
        },
        {
            label: "Rejected",
            state: "rejected",
            color: "#252525",
        },
        {
            label: "Failed",
            state: "failed",
            color: "#ff1d38",
        },
    ];

    return (
        <div className="key-panel-container">
            <div className="card key-panel">
                {statuses.map((s) => {
                    return (
                        <div className="key-panel-item" key={s.state}>
                            <div
                                className="key-marker"
                                style={{
                                    backgroundColor: s.color,
                                }}
                            />
                            <div className="key-label">{s.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
