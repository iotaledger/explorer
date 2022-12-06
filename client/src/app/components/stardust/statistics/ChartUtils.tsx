import moment from "moment";
import React, { useCallback } from "react";

export const noDataView = (width: number, height: number) => (
    <div className="no-data--wrapper" style={{ width, height }}>
        <p>No Data</p>
    </div>
);

export const useSingleValueTooltip = (
    data: { [name: string]: number; time: number }[],
    label?: string
) => {
    const buildTooltip = useCallback((dataPoint: { [name: string]: number }): string => (
        `
            <p>${moment.unix(dataPoint.time).format("DD-MM-YYYY")}</p>
            <p>
                <span class="label">${label ?? "count"}: </span>
                <span class="value">${dataPoint.n}</span>
            </p>
        `
    ), [data, label]);

    return buildTooltip;
};

export const useMultiValueTooltip = (
    data: { [name: string]: number; time: number }[],
    subgroups: string[],
    colors: string[],
    groupLabels?: string[]
) => {
    const buildTooltip = useCallback((dataPoint: { [key: string]: number }): string => (`
        <p>${moment.unix(dataPoint.time).format("DD-MM-YYYY")}</p>
        ${subgroups.map((subgroup, idx) => (`
                <p>
                    <span class="dot" style="background-color: ${colors[idx]}"></span>
                    <span class="label">${groupLabels ? groupLabels[idx] : subgroup}: </span>
                    <span class="value">${dataPoint[subgroup]}</span>
                </p>
        `)).join("")}`
    ), [data, subgroups, groupLabels, colors]);

    return buildTooltip;
};

