import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IDistributionEntry } from "../../../../models/api/stardust/chronicle/ITokenDistributionResponse";

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

export const useTokenDistributionTooltip = (
    data: IDistributionEntry[] | null,
    tokenInfo: INodeInfoBaseToken
) => {
    const buildTooltip = useCallback((dataPoint: IDistributionEntry): string => (
        `
            <p>
                <span class="label">${"Number of addresses"}: </span>
                <span class="value">${dataPoint.addressCount}</span>
            </p>
            <p>
                <span class="label">${`Total ${tokenInfo.unit} held`}: </span>
                <span class="value">~${formatAmount(Number(dataPoint.totalBalance), tokenInfo, false, 0)}</span>
            </p>
        `
    ), [data]);

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

    const handleResize = useCallback(debounce(() => {
        setWrapperSize({
            wrapperWidth: chartWrapper?.clientWidth ?? 0,
            wrapperHeight: chartWrapper?.clientHeight ?? 0
        });
    }), [chartWrapper]);

    useEffect(() => {
        handleResize();

        let observer: ResizeObserver | null = null;
        if (chartWrapper) {
            observer = new ResizeObserver(resizeEntry => {
                if (
                    resizeEntry?.length > 0 &&
                    resizeEntry[0].contentRect?.width !== wrapperSize.wrapperWidth &&
                    resizeEntry[0].contentRect?.height !== wrapperSize.wrapperHeight
                ) {
                    handleResize();
                }
            });

            observer.observe(chartWrapper);
        }

        return () => {
            observer?.disconnect();
        };
    }, [chartWrapper]);

    return [wrapperSize, setChartWrapper];
};

export const useTouchMoveEffect = (eventHandler: () => void) => {
    useEffect(() => {
        window.addEventListener("touchmove", eventHandler);
        return () => {
            window.removeEventListener("touchmove", eventHandler);
        };
    }, []);
};

const debounce = (func: () => void) => {
    let timerId: NodeJS.Timeout | undefined;
    return () => {
        clearTimeout(timerId);
        timerId = setTimeout(() => func(), 100);
    };
};

export const determineGraphLeftPadding = (dataMaxY: number) => {
    const digitsN = Math.ceil(dataMaxY).toString().length;
    if (digitsN > 8) {
        return 35;
    } else if (digitsN < 4 && dataMaxY > 1) {
        return 25;
    }
    return 30;
};

export const d3FormatSpecifier = (dataMaxY: number) => (dataMaxY < 1 ? "~g" : "~s");

export const getSubunitThreshold = (tokenInfo: INodeInfoBaseToken) => (
    tokenInfo?.decimals && tokenInfo.decimals > 0 ?
        Math.pow(10, tokenInfo.decimals) : null
);

