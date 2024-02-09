import { ProtocolInfo } from "@iota/sdk-wasm-nova/web";
import { unixTimestampToSlotIndexConverter, slotIndexToUnixTimeRangeConverter } from "./novaTimeUtils";

const mockProtocolInfo: ProtocolInfo = {
    // @ts-expect-error Irrelevant fields omitted
    parameters: {
        type: 0,
        version: 3,
        networkName: "test",
        bech32Hrp: "rms",
        tokenSupply: 1813620509061365n,

        // <properties used in slot calculations>
        genesisSlot: 5,
        genesisUnixTimestamp: 1707321857n, // 7 February 2024 16:04:17
        slotDurationInSeconds: 10,
        // </properties used in slot calculations>

        slotsPerEpochExponent: 13,
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

const slotHalfSeconds = Math.floor(slotDurationInSeconds / 2);

const unixTimestampToSlotIndex = unixTimestampToSlotIndexConverter(mockProtocolInfo);
const slotIndexToUnixTimeRange = slotIndexToUnixTimeRangeConverter(mockProtocolInfo);

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

describe("slotIndexToUnixTimestamp", () => {
    test("should return genesis slot timestamp when passed a slotIndex lower than genesisSlot", () => {
        let target = genesisSlot - 1; // 4
        const expectedGenesisTimestampRange = {
            from: genesisUnixTimestamp - slotDurationInSeconds,
            to: genesisUnixTimestamp,
        };

        let slotIndex = slotIndexToUnixTimeRange(target);
        expect(slotIndex).toStrictEqual(expectedGenesisTimestampRange);

        target = genesisSlot - 2; // 3
        slotIndex = slotIndexToUnixTimeRange(target);
        expect(slotIndex).toStrictEqual(expectedGenesisTimestampRange);

        target = genesisSlot - 3; // 2
        slotIndex = slotIndexToUnixTimeRange(target);
        expect(slotIndex).toStrictEqual(expectedGenesisTimestampRange);
    });

    test("should return correct genesis slot timestamp range", () => {
        const target = genesisSlot;

        const slotIndex = slotIndexToUnixTimeRange(target);

        expect(slotIndex).toStrictEqual({
            from: genesisUnixTimestamp - slotDurationInSeconds,
            to: genesisUnixTimestamp,
        });
    });

    test("should return timestamp range of 'genesis slot + x' when passed 'genesis slot + x'", () => {
        let target = genesisSlot + 1;

        let slotIndex = slotIndexToUnixTimeRange(target);

        expect(slotIndex).toStrictEqual({
            from: genesisUnixTimestamp,
            to: genesisUnixTimestamp + 1 * slotDurationInSeconds,
        });

        target = genesisSlot + 2;

        slotIndex = slotIndexToUnixTimeRange(target);

        expect(slotIndex).toStrictEqual({
            from: genesisUnixTimestamp + 1 * slotDurationInSeconds,
            to: genesisUnixTimestamp + 2 * slotDurationInSeconds,
        });

        target = genesisSlot + 3;

        slotIndex = slotIndexToUnixTimeRange(target);

        expect(slotIndex).toStrictEqual({
            from: genesisUnixTimestamp + 2 * slotDurationInSeconds,
            to: genesisUnixTimestamp + 3 * slotDurationInSeconds,
        });

        target = genesisSlot + 5;

        slotIndex = slotIndexToUnixTimeRange(target);

        expect(slotIndex).toStrictEqual({
            from: genesisUnixTimestamp + 4 * slotDurationInSeconds,
            to: genesisUnixTimestamp + 5 * slotDurationInSeconds,
        });

        target = genesisSlot + 8;

        slotIndex = slotIndexToUnixTimeRange(target);

        expect(slotIndex).toStrictEqual({
            from: genesisUnixTimestamp + 7 * slotDurationInSeconds,
            to: genesisUnixTimestamp + 8 * slotDurationInSeconds,
        });
    });

    test("should work for big inputs", () => {
        const target = 397295980; // Slot of 1 January 2150 00:00:01

        const slotIndex = slotIndexToUnixTimeRange(target);

        expect(slotIndex).toStrictEqual({
            from: 5680281597,
            to: 5680281607,
        });
    });
});

describe("slotIndexToUnixTimestamp & unixTimestampToSlotIndex", () => {
    test("should be able to go from slot to timestamp and back correctly", () => {
        const targetSlotIndex = 12; // Slot of 1 January 2150 00:00:01

        const slotTimestamp = slotIndexToUnixTimeRange(targetSlotIndex);

        expect(slotTimestamp).toStrictEqual({
            from: 1707321917,
            to: 1707321927,
        });

        const resultSlotIndex = unixTimestampToSlotIndex(slotTimestamp.from + slotHalfSeconds);

        expect(resultSlotIndex).toBe(targetSlotIndex);
    });

    test("should be able to go from timestamp to slot and back correctly", () => {
        const targetTimestamp = 1707484909; // 9 February 2024 13:21:49

        const slotIndex = unixTimestampToSlotIndex(targetTimestamp);

        expect(slotIndex).toBe(16311);

        const resultTimestamp = slotIndexToUnixTimeRange(slotIndex);

        expect(resultTimestamp.from).toBeLessThan(targetTimestamp);
        expect(resultTimestamp.to).toBeGreaterThan(targetTimestamp);
    });
});
