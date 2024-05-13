import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import { Axis, axisBottom, axisLeft } from "d3-axis";
import { format } from "d3-format";
import { NumberValue, ScaleLinear, ScaleTime } from "d3-scale";
import { timeDay, timeMonth, timeWeek, timeYear } from "d3-time";
import { timeFormat } from "d3-time-format";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { IDistributionEntry } from "~models/api/stardust/chronicle/ITokenDistributionResponse";

export const TRANSITIONS_DURATION_MS = 750;

export const noDataView = () => (
    <div className="no-data--wrapper">
        <p>No Data</p>
    </div>
);

const formatToMagnituge = (val: number) => format(d3FormatSpecifier(val));
export const useSingleValueTooltip = (data: { [name: string]: number; time: number }[], label?: string) => {
    const buildTooltip = useCallback(
        (dataPoint: { [name: string]: number }): string =>
            `
            <p>${moment.unix(dataPoint.time).format("DD-MM-YYYY")}</p>
            <p>
                <span class="label">${label ?? "count"}: </span>
                <span class="value">${formatToMagnituge(dataPoint.n)(dataPoint.n)}</span>
            </p>
        `,
        [data, label],
    );

    return buildTooltip;
};
export const useMultiValueTooltip = (
    data: { [name: string]: number; time: number }[],
    subgroups: string[],
    colors: string[],
    groupLabels?: string[],
) => {
    const buildTooltip = useCallback(
        (dataPoint: { [key: string]: number }): string => `
        <p>${moment.unix(dataPoint.time).format("DD-MM-YYYY")}</p>
        ${subgroups
            .map(
                (subgroup, idx) => `
                <p>
                    <span class="dot" style="background-color: ${colors[idx]}"></span>
                    <span class="label">${groupLabels ? groupLabels[idx] : subgroup}: </span>
                    <span class="value">${formatToMagnituge(dataPoint[subgroup])(dataPoint[subgroup])}</span>
                </p>
        `,
            )
            .join("")}`,
        [data, subgroups, groupLabels, colors],
    );

    return buildTooltip;
};

export const useTokenDistributionTooltip = (data: IDistributionEntry[] | null, tokenInfo: INodeInfoBaseToken) => {
    const buildTooltip = useCallback(
        (dataPoint: IDistributionEntry): string =>
            `
            <p>
                <span class="label">${"Number of addresses"}: </span>
                <span class="value">${dataPoint.addressCount}</span>
            </p>
            <p>
                <span class="label">${`Total ${tokenInfo.unit} held`}: </span>
                <span class="value">~${formatAmount(Number(dataPoint.totalBalance), tokenInfo, false, 0)}</span>
            </p>
        `,
        [data],
    );

    return buildTooltip;
};

export const useChartWrapperSize: () => [
    { wrapperWidth?: number; wrapperHeight?: number },
    React.Dispatch<React.SetStateAction<HTMLDivElement | null>>,
] = () => {
    const [chartWrapper, setChartWrapper] = useState<HTMLDivElement | null>(null);
    const [wrapperSize, setWrapperSize] = useState<{ wrapperWidth?: number; wrapperHeight?: number }>({
        wrapperWidth: undefined,
        wrapperHeight: undefined,
    });

    const handleResize = useCallback(
        debounce(() => {
            setWrapperSize({
                wrapperWidth: chartWrapper?.clientWidth ?? 0,
                wrapperHeight: chartWrapper?.clientHeight ?? 0,
            });
        }),
        [chartWrapper],
    );

    useEffect(() => {
        handleResize();

        let observer: ResizeObserver | null = null;
        if (chartWrapper) {
            observer = new ResizeObserver((resizeEntry) => {
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

export const getSubunitThreshold = (tokenInfo: INodeInfoBaseToken) =>
    tokenInfo?.decimals && tokenInfo.decimals > 0 ? Math.pow(10, tokenInfo.decimals) : null;

const formatHidden = timeFormat("");
const formatDay = timeFormat("%a %d");
const formatWeek = timeFormat("%b %d");
const formatMonth = timeFormat("%B");
const formatYear = timeFormat("%Y");

const tickMultiFormat = (date: Date | NumberValue) => {
    const theDate = date as Date;
    if (timeDay(theDate) < theDate) {
        return formatHidden(theDate);
    } else if (timeMonth(theDate) < theDate) {
        if (timeWeek(theDate) < theDate) {
            return formatDay(theDate);
        }
        return formatWeek(theDate);
    } else if (timeYear(theDate) < theDate) {
        return formatMonth(theDate);
    }

    return formatYear(theDate);
};

export const buildXAxis: (scale: ScaleTime<number, number>) => Axis<Date> = (scale) =>
    axisBottom(scale).ticks(8).tickFormat(tickMultiFormat) as Axis<Date>;

export const buildYAxis = (scale: ScaleLinear<number, number>, theYMax: number) =>
    axisLeft(scale.nice()).tickFormat(format(d3FormatSpecifier(theYMax)));

export const timestampToDate = (timestamp: number) => moment.unix(timestamp).hours(0).minutes(0).toDate();

export const computeDataIncludedInSelection = (
    scale: ScaleTime<number, number>,
    data: {
        [name: string]: number;
        time: number;
    }[],
) => {
    const selectedData: { [name: string]: number; time: number }[] = [];

    const from = scale.domain()[0];
    from.setHours(0, 0, 0, 0);
    const to = scale.domain()[1];
    to.setHours(0, 0, 0, 0);
    for (const d of data) {
        const target = timestampToDate(d.time);
        target.setHours(0, 0, 0, 0);
        if (from <= target && target <= to) {
            selectedData.push(d);
        }
    }

    return selectedData;
};

export const computeHalfLineWidth = (data: { [name: string]: number; time: number }[], x: ScaleTime<number, number>) =>
    data.length > 1 ? ((x(timestampToDate(data[1].time)) ?? 0) - (x(timestampToDate(data[0].time)) ?? 0)) / 2 : 0;
