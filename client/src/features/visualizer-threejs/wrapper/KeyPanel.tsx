import React from "react";
import { BlockState } from "@iota/sdk-wasm-nova/web";
import {
    ACCEPTED_BLOCK_COLOR_HASH,
    CONFIRMED_BLOCK_COLOR_HASH,
    FINALIZED_BLOCK_COLOR_HASH,
    PENDING_BLOCK_COLOR_HASH,
    SEARCH_RESULT_COLOR_HASH,
} from "../constants";
import "./KeyPanel.scss";

export const KeyPanel: React.FC = () => {
    const statuses: {
        label: string;
        state: BlockState | "searchResult";
        color: string;
    }[] = [
        {
            label: "Pending",
            state: "pending",
            color: PENDING_BLOCK_COLOR_HASH,
        },
        {
            label: "Accepted",
            state: "accepted",
            color: ACCEPTED_BLOCK_COLOR_HASH,
        },
        {
            label: "Confirmed",
            state: "confirmed",
            color: CONFIRMED_BLOCK_COLOR_HASH,
        },
        {
            label: "Finalized",
            state: "finalized",
            color: FINALIZED_BLOCK_COLOR_HASH,
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
        {
            label: "Search result",
            state: "searchResult",
            color: SEARCH_RESULT_COLOR_HASH,
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
