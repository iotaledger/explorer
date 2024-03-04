import { ProtocolParametersResponse } from "@iota/sdk-wasm-nova/web";
import {
    unixTimestampToSlotIndexConverter,
    slotIndexToUnixTimeRangeConverter,
    slotIndexToEpochIndexConverter,
    unixTimestampToEpochIndexConverter,
    epochIndexToUnixTimeRangeConverter,
    epochIndexToSlotIndexRangeConverter,
    getRegistrationSlotFromEpochIndex,
} from "./novaTimeUtils";

const mockProtocolInfo: ProtocolParametersResponse = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parameters: {
        type: 0,
        version: 3,
        networkName: "test",
        bech32Hrp: "rms",
        tokenSupply: "1813620509061365",
        // <properties used in slot/epoch calculations>
        genesisSlot: 5,
        genesisUnixTimestamp: "1707321857",
        slotDurationInSeconds: 10,
        slotsPerEpochExponent: 13,
        // </properties used in slot/epoch calculations>
        stakingUnbondingPeriod: 10,
        validationBlocksPerSlot: 10,
        punishmentEpochs: 10,
        livenessThresholdLowerBound: 15,
        livenessThresholdUpperBound: 30,
        minCommittableAge: 10,
        maxCommittableAge: 20,
        epochNearingThreshold: 60,
        targetCommitteeSize: 32,
        chainSwitchingThreshold: 3,
    },
    startEpoch: 0,
};

const genesisSlot = mockProtocolInfo.parameters.genesisSlot;
const genesisUnixTimestamp = Number(mockProtocolInfo.parameters.genesisUnixTimestamp); // 7 February 2024 16:04:17
const slotDurationInSeconds = mockProtocolInfo.parameters.slotDurationInSeconds;
const slotsPerEpochExponent = mockProtocolInfo.parameters.slotsPerEpochExponent;

const slotHalfSeconds = Math.floor(slotDurationInSeconds / 2);
const slotsInEpoch = Math.pow(2, slotsPerEpochExponent); // 8192

const unixTimestampToSlotIndex = unixTimestampToSlotIndexConverter(mockProtocolInfo);
const slotIndexToUnixTimeRange = slotIndexToUnixTimeRangeConverter(mockProtocolInfo);
const slotIndexToEpochIndex = slotIndexToEpochIndexConverter(mockProtocolInfo);
const unixTimestampToEpochIndex = unixTimestampToEpochIndexConverter(mockProtocolInfo);
const epochIndexToSlotIndexRange = epochIndexToSlotIndexRangeConverter(mockProtocolInfo);
const epochIndexToUnixTimeRange = epochIndexToUnixTimeRangeConverter(mockProtocolInfo);
const getRegistrationSlot = getRegistrationSlotFromEpochIndex(mockProtocolInfo);

describe("unixTimestampToSlotIndex", () => {
    test("should return genesis slot when timestamp is lower than genesisUnixTimestamp", () => {
        const target = 1707321853; // 7 February 2024 16:04:13

        const slotIndex = unixTimestampToSlotIndex(target);

        expect(slotIndex).toBe(mockProtocolInfo.parameters.genesisSlot);
    });

    test("should return genesis slot + 1 when passed genesisUnixTimestamp", () => {
        const target = genesisUnixTimestamp;

        const slotIndex = unixTimestampToSlotIndex(target);

        expect(slotIndex).toBe(genesisSlot + 1);
    });

    test("should return the correct slot", () => {
        const target = genesisUnixTimestamp + 42 * slotDurationInSeconds; // 42 slots after genesis (in unix seconds)

        const slotIndex = unixTimestampToSlotIndex(target);

        expect(slotIndex).toBe(genesisSlot + 43); // we are in 43rd slot
    });

    test("should work for big inputs", () => {
        const target = 5680281601; // 1 January 2150 00:00:01

        const slotIndex = unixTimestampToSlotIndex(target);

        expect(slotIndex).toBe(397295980);
    });
});

describe("slotIndexToUnixTimeRange", () => {
    test("should return genesis slot timestamp when passed a slotIndex lower than genesisSlot", () => {
        let target = genesisSlot - 1; // 4
        const expectedGenesisTimestampRange = {
            from: genesisUnixTimestamp - slotDurationInSeconds,
            to: genesisUnixTimestamp,
        };

        let slotUnixTimeRange = slotIndexToUnixTimeRange(target);
        expect(slotUnixTimeRange).toStrictEqual(expectedGenesisTimestampRange);

        target = genesisSlot - 2; // 3
        slotUnixTimeRange = slotIndexToUnixTimeRange(target);
        expect(slotUnixTimeRange).toStrictEqual(expectedGenesisTimestampRange);

        target = genesisSlot - 3; // 2
        slotUnixTimeRange = slotIndexToUnixTimeRange(target);
        expect(slotUnixTimeRange).toStrictEqual(expectedGenesisTimestampRange);
    });

    test("should return correct genesis slot timestamp range", () => {
        const target = genesisSlot;

        const slotUnixTimeRange = slotIndexToUnixTimeRange(target);

        expect(slotUnixTimeRange).toStrictEqual({
            from: genesisUnixTimestamp - slotDurationInSeconds,
            to: genesisUnixTimestamp,
        });
    });

    test("should return timestamp range of 'genesis slot + x' when passed 'genesis slot + x'", () => {
        let target = genesisSlot + 1;

        let slotUnixTimeRange = slotIndexToUnixTimeRange(target);

        expect(slotUnixTimeRange).toStrictEqual({
            from: genesisUnixTimestamp,
            to: genesisUnixTimestamp + 1 * slotDurationInSeconds,
        });

        target = genesisSlot + 2;

        slotUnixTimeRange = slotIndexToUnixTimeRange(target);

        expect(slotUnixTimeRange).toStrictEqual({
            from: genesisUnixTimestamp + 1 * slotDurationInSeconds,
            to: genesisUnixTimestamp + 2 * slotDurationInSeconds,
        });

        target = genesisSlot + 3;

        slotUnixTimeRange = slotIndexToUnixTimeRange(target);

        expect(slotUnixTimeRange).toStrictEqual({
            from: genesisUnixTimestamp + 2 * slotDurationInSeconds,
            to: genesisUnixTimestamp + 3 * slotDurationInSeconds,
        });

        target = genesisSlot + 5;

        slotUnixTimeRange = slotIndexToUnixTimeRange(target);

        expect(slotUnixTimeRange).toStrictEqual({
            from: genesisUnixTimestamp + 4 * slotDurationInSeconds,
            to: genesisUnixTimestamp + 5 * slotDurationInSeconds,
        });

        target = genesisSlot + 8;

        slotUnixTimeRange = slotIndexToUnixTimeRange(target);

        expect(slotUnixTimeRange).toStrictEqual({
            from: genesisUnixTimestamp + 7 * slotDurationInSeconds,
            to: genesisUnixTimestamp + 8 * slotDurationInSeconds,
        });
    });

    test("should work for big inputs", () => {
        const target = 397295980; // Slot of 1 January 2150 00:00:01

        const slotUnixTimeRange = slotIndexToUnixTimeRange(target);

        expect(slotUnixTimeRange).toStrictEqual({
            from: 5680281597,
            to: 5680281607,
        });
    });
});

describe("slotIndexToUnixTimeRange & unixTimestampToSlotIndex", () => {
    test("should be able to go from slot to timestamp and back correctly", () => {
        const targetSlotIndex = 12; // Slot of 1 January 2150 00:00:01

        const targetSlotUnixTimeRange = slotIndexToUnixTimeRange(targetSlotIndex);

        expect(targetSlotUnixTimeRange).toStrictEqual({
            from: 1707321917,
            to: 1707321927,
        });

        const resultSlotIndex = unixTimestampToSlotIndex(targetSlotUnixTimeRange.from + slotHalfSeconds);

        expect(resultSlotIndex).toBe(targetSlotIndex);
    });

    test("should be able to go from timestamp to slot and back correctly", () => {
        const targetTimestamp = 1707484909; // 9 February 2024 13:21:49

        const slotIndex = unixTimestampToSlotIndex(targetTimestamp);

        expect(slotIndex).toBe(16311);

        const slotUnixTimeRange = slotIndexToUnixTimeRange(slotIndex);

        expect(slotUnixTimeRange.from).toBeLessThan(targetTimestamp);
        expect(slotUnixTimeRange.to).toBeGreaterThan(targetTimestamp);
    });
});

describe("slotIndexToEpochIndex", () => {
    test("should return epoch 0 for slot index less then slotsInEpoch + genesisSlot", () => {
        const targetSlotIndex = slotsInEpoch + genesisSlot - 1;

        const epochIndex = slotIndexToEpochIndex(targetSlotIndex);

        expect(epochIndex).toBe(0);
    });

    test("should return epoch 1 for slot index of slotsInEpoch + genesisSlot", () => {
        const targetSlotIndex = slotsInEpoch + genesisSlot;

        const epochIndex = slotIndexToEpochIndex(targetSlotIndex);

        expect(epochIndex).toBe(1);
    });

    test("should return epoch 2 for slot index a bit after slotsInEpoch", () => {
        const targetSlotIndex = slotsInEpoch * 2 + genesisSlot;

        const epochIndex = slotIndexToEpochIndex(targetSlotIndex);

        expect(epochIndex).toBe(2);
    });
});

describe("unixTimestampToEpochIndex", () => {
    test("should return the correct epoch index based on timestamp", () => {
        const targetTimestamp = 1707493847; // 9 February 2024 15:50:47

        const epochIndex = unixTimestampToEpochIndex(targetTimestamp);

        expect(epochIndex).toBe(2);
    });
});

describe("epochIndexToSlotIndexRange", () => {
    test("should return the correct slot index range for epoch 0", () => {
        const targetEpoch = 0;

        epochIndexToSlotIndexRange(targetEpoch);

        expect(epochIndexToSlotIndexRange(targetEpoch)).toStrictEqual({
            from: genesisSlot,
            to: genesisSlot + slotsInEpoch,
        });
    });

    test("should return the correct slot index range for epoch 1", () => {
        const targetEpoch = 1;

        const slotIndexRange = epochIndexToSlotIndexRange(targetEpoch);

        expect(slotIndexRange).toStrictEqual({
            from: genesisSlot + slotsInEpoch,
            to: genesisSlot + slotsInEpoch * 2,
        });
    });
});

describe("epochIndexToUnixTimeRange", () => {
    test("should return the correct unix time range for epoch 0", () => {
        const targetEpoch = 0;

        const epochUnixTimeRange = epochIndexToUnixTimeRange(targetEpoch);

        expect(epochUnixTimeRange).toStrictEqual({
            from: genesisUnixTimestamp - slotDurationInSeconds,
            to: genesisUnixTimestamp + (slotsInEpoch - 1) * slotDurationInSeconds,
        });
    });
});

describe("getRegistrationSlotFromEpochIndex", () => {
    test("should return the correct slot index given an epoch index", () => {
        const epochNearingThreshold = mockProtocolInfo.parameters.epochNearingThreshold;
        const currentEpoch = 5;

        const currentEpochSlotRange = epochIndexToSlotIndexRange(currentEpoch);

        const regitrationSlot = getRegistrationSlot(currentEpoch);

        expect(regitrationSlot).toBeGreaterThan(currentEpochSlotRange.from);
        expect(regitrationSlot).toBeLessThan(currentEpochSlotRange.to);
        expect(regitrationSlot).toBe(currentEpochSlotRange.to - epochNearingThreshold - 1);
    });
});
