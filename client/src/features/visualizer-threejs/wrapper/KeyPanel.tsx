import React, { memo } from "react";
import { BlockState } from "@iota/sdk-wasm-nova/web";
import { ACCEPTED_BLOCK_COLOR, CONFIRMED_BLOCK_COLOR, FINALIZED_BLOCK_COLOR, PENDING_BLOCK_COLOR, SEARCH_RESULT_COLOR } from "../constants";
import "./KeyPanel.scss";
import StatsPanel from "~features/visualizer-threejs/wrapper/StatsPanel";

export const KeyPanel = ({ network }: { network: string }) => {
    const statuses: {
        label: string;
        state: BlockState | "searchResult";
        color: string;
    }[] = [
        {
            label: "Pending",
            state: "pending",
            color: PENDING_BLOCK_COLOR.getStyle(),
        },
        {
            label: "Accepted",
            state: "accepted",
            color: ACCEPTED_BLOCK_COLOR.getStyle(),
        },
        {
            label: "Confirmed",
            state: "confirmed",
            color: CONFIRMED_BLOCK_COLOR.getStyle(),
        },
        {
            label: "Finalized",
            state: "finalized",
            color: FINALIZED_BLOCK_COLOR.getStyle(),
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
            color: SEARCH_RESULT_COLOR.getStyle(),
        },
    ];

    return (
        <div className="info-container">
            <div className="card key-panel-list">
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
            <StatsPanel network={network} />
        </div>
    );
};

export default memo(KeyPanel);
