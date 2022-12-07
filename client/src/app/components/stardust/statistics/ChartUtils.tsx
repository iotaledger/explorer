import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";

export const noDataView = () => (
    <div className="no-data--wrapper">
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

export const useChartWrapperSize: () => [
    { wrapperWidth?: number; wrapperHeight?: number },
    React.Dispatch<React.SetStateAction<HTMLDivElement | null>>
] = () => {
    const [chartWrapper, setChartWrapper] = useState<HTMLDivElement | null>(null);
    const [wrapperSize, setWrapperSize] = useState<{ wrapperWidth?: number; wrapperHeight?: number }>({
        wrapperWidth: undefined,
        wrapperHeight: undefined
    });

    const handleResize = useCallback(() => {
        setWrapperSize({
            wrapperWidth: chartWrapper?.clientWidth ?? 0,
            wrapperHeight: chartWrapper?.clientHeight ?? 0
        });
    }, [chartWrapper]);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [chartWrapper]);

    return [wrapperSize, setChartWrapper];
};

