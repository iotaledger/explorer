import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { buildShimmerClaimedStats } from "./ShimmerClaimedUtils";

const TOKEN_INFO: INodeInfoBaseToken = {
    name: "Shimmer",
    tickerSymbol: "SMR",
    unit: "SMR",
    subunit: "glow",
    decimals: 6,
    useMetricPrefix: false
};

describe("build shimmer stats", () => {
    it("should display percent", () => {
        let [claimed, percent] = buildShimmerClaimedStats("1", "100", TOKEN_INFO);
        expect(claimed).toBe("1 glow");
        expect(percent).toBe("1%");

        [claimed, percent] = buildShimmerClaimedStats("5", "100", TOKEN_INFO);
        expect(claimed).toBe("5 glow");
        expect(percent).toBe("5%");

        [claimed, percent] = buildShimmerClaimedStats("1450896407249092", "1450896407249092", TOKEN_INFO);
        expect(claimed).toBe("1.45 GSMR");
        expect(percent).toBe("100%");
    });

    it("should display <0.01% on small fractions", () => {
        let [claimed, percent] = buildShimmerClaimedStats("1", "1000", TOKEN_INFO);
        expect(claimed).toBe("1 glow");
        expect(percent).toBe("0.1%");

        [claimed, percent] = buildShimmerClaimedStats("1", "10009", TOKEN_INFO);
        expect(claimed).toBe("1 glow");
        expect(percent).toBe("<0.01%");

        [claimed, percent] = buildShimmerClaimedStats("1", "10000", TOKEN_INFO);
        expect(claimed).toBe("1 glow");
        expect(percent).toBe("0.01%");

        [claimed, percent] = buildShimmerClaimedStats("5123123", "1450896407249092", TOKEN_INFO);
        expect(claimed).toBe("5.12 SMR");
        expect(percent).toBe("<0.01%");
    });

    it("should display in glow for values less then one SMR", () => {
        let [claimed, percent] = buildShimmerClaimedStats("999999", "1450896407", TOKEN_INFO);
        expect(claimed).toBe("999999 glow");
        expect(percent).toBe("0.06%");

        [claimed, percent] = buildShimmerClaimedStats("1000000", "1450896407", TOKEN_INFO);
        expect(claimed).toBe("1 SMR");
        expect(percent).toBe("0.06%");
    });

    it("should format SMR to magnitudes", () => {
        let [claimed, percent] = buildShimmerClaimedStats("999999999", "1450896407", TOKEN_INFO);
        expect(claimed).toBe("999.99 SMR");
        expect(percent).toBe("68.92%");

        [claimed, percent] = buildShimmerClaimedStats("1234198475", "1450896407", TOKEN_INFO);
        expect(claimed).toBe("1.23 KSMR");
        expect(percent).toBe("85.06%");
    });
});
