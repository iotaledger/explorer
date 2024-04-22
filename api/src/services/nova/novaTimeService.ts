import { Client, ProtocolParameters } from "@iota/sdk-nova";
import {
    epochIndexToSlotIndexRangeConverter,
    epochIndexToUnixTimeRangeConverter,
    slotIndexToEpochIndexConverter,
    slotIndexToUnixTimeRangeConverter,
    unixTimestampToEpochIndexConverter,
    unixTimestampToSlotIndexConverter,
} from "../../utils/nova/novaTimeUtils";

export class NovaTimeService {
    private readonly protocolParameters: ProtocolParameters;

    private readonly unixTimestampToSlotIndex: (unixTimestampSeconds: number) => number;

    private readonly slotIndexToUnixTimeRange: (targetSlotIndex: number) => { from: number; to: number };

    private readonly slotIndexToEpochIndex: (targetSlotIndex: number) => number;

    private readonly unixTimestampToEpochIndex: (unixTimestampSeconds: number) => number;

    private readonly epochIndexToSlotIndexRange: (targetEpochIndex: number) => { from: number; to: number };

    private readonly epochIndexToUnixTimeRange: (targetEpochIndex: number) => { from: number; to: number };

    constructor(protocolParameters: ProtocolParameters) {
        this.protocolParameters = protocolParameters;

        this.unixTimestampToSlotIndex = unixTimestampToSlotIndexConverter(protocolParameters);
        this.slotIndexToUnixTimeRange = slotIndexToUnixTimeRangeConverter(protocolParameters);
        this.slotIndexToEpochIndex = slotIndexToEpochIndexConverter(protocolParameters);
        this.unixTimestampToEpochIndex = unixTimestampToEpochIndexConverter(protocolParameters);
        this.epochIndexToSlotIndexRange = epochIndexToSlotIndexRangeConverter(protocolParameters);
        this.epochIndexToUnixTimeRange = epochIndexToUnixTimeRangeConverter(protocolParameters);
    }

    public get protocolParams(): ProtocolParameters {
        return this.protocolParameters;
    }

    public static async build(client: Client) {
        const protocolParameters = await client.getProtocolParameters();
        return new NovaTimeService(protocolParameters);
    }

    public getUnixTimestampToSlotIndex(unixTimestampSeconds: number): number {
        return this.unixTimestampToSlotIndex(unixTimestampSeconds);
    }

    public getSlotIndexToUnixTimeRange(targetSlotIndex: number): { from: number; to: number } {
        return this.slotIndexToUnixTimeRange(targetSlotIndex);
    }

    public getSlotIndexToEpochIndex(targetSlotIndex: number): number {
        return this.slotIndexToEpochIndex(targetSlotIndex);
    }

    public getUnixTimestampToEpochIndex(unixTimestampSeconds: number): number {
        return this.unixTimestampToEpochIndex(unixTimestampSeconds);
    }

    public getEpochIndexToSlotIndexRange(targetEpochIndex: number): { from: number; to: number } {
        return this.epochIndexToSlotIndexRange(targetEpochIndex);
    }

    public getEpochIndexToUnixTimeRange(targetEpochIndex: number): { from: number; to: number } {
        return this.epochIndexToUnixTimeRange(targetEpochIndex);
    }
}
