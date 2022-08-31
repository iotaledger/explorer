import { IFeedItem } from "../../../../models/feed/IFeedItem";

export const getFilterAppliers = (minLimit: number, maxLimit: number) => [
    {
        payloadType: "Zero only",
        apply: (item: IFeedItem) => item.value === 0
    },
    {
        payloadType: "Non-zero only",
        apply: (item: IFeedItem) =>
            item.value !== undefined &&
            item.value !== 0 &&
            Math.abs(item.value) >= minLimit &&
            Math.abs(item.value) <= maxLimit
    },
    {
        payloadType: "Transaction",
        apply: (item: IFeedItem) =>
            item.value !== undefined &&
            item.value !== 0 &&
            Math.abs(item.value) >= minLimit &&
            Math.abs(item.value) <= maxLimit
    },
    {
        payloadType: "Milestone",
        apply: (item: IFeedItem) =>
            item.payloadType === "MS"

    },
    {
        payloadType: "Data",
        apply: (item: IFeedItem) =>
            item.payloadType === "Data"
    },
    {
        payloadType: "No payload",
        apply: (item: IFeedItem) =>
            item.payloadType === "None"

    }
];

