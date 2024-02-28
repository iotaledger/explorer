import React, { memo } from "react";
import { BlockState } from "@iota/sdk-wasm-nova/web";
import { SEARCH_RESULT_COLOR, THEME_BLOCK_COLORS } from "../constants";
import StatsPanel from "~features/visualizer-threejs/wrapper/StatsPanel";
import { ThemeMode } from "../enums";
import ColorPanel from "./ColorPanel";
import "./KeyPanel.scss";

export const KeyPanel = ({ network, themeMode }: { network: string; themeMode: ThemeMode }) => {
    const statuses: {
        label: string;
        state: BlockState | "searchResult";
    }[] = [
        {
            label: "Pending",
            state: "pending",
        },
        {
            label: "Accepted",
            state: "accepted",
        },
        {
            label: "Confirmed",
            state: "confirmed",
        },
        {
            label: "Finalized",
            state: "finalized",
        },
        {
            label: "Rejected",
            state: "rejected",
        },
        {
            label: "Failed",
            state: "failed",
        },
        {
            label: "Search result",
            state: "searchResult",
        },
    ];

    return (
        <div className="info-container">
            <div className="card key-panel-list">
                {statuses.map(({ label, state }) => {
                    if (state === "searchResult") {
                        return <ColorPanel key={state} label={label} color={SEARCH_RESULT_COLOR.getStyle()} />;
                    } else {
                        const targetColor = THEME_BLOCK_COLORS[themeMode][state];
                        if (Array.isArray(targetColor)) {
                            return <ColorPanel key={state} label={label} color={targetColor.map((color) => color.getStyle())} />;
                        }
                        return <ColorPanel key={state} label={label} color={targetColor.getStyle()} />;
                    }
                })}
            </div>
            <StatsPanel network={network} />
        </div>
    );
};

export default memo(KeyPanel);
