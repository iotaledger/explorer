import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import { buildShimmerClaimedStats } from "./ShimmerClaimedUtils";

const TOKEN_INFO: INodeInfoBaseToken = {
    name: "Shimmer",
    tickerSymbol: "SMR",
    unit: "SMR",
    subunit: "glow",
    decimals: 6,
    useMetricPrefix: false,
};

test("buildShimmerClaimedStats should display percent", () => {
    let [claimed, percent] = buildShimmerClaimedStats("1", "100", TOKEN_INFO);
    expect(claimed).toBe("1 glow");
    expect(percent).toBe("1%");

    [claimed, percent] = buildShimmerClaimedStats("5", "100", TOKEN_INFO);
    expect(claimed).toBe("5 glow");
    expect(percent).toBe("5%");

    [claimed, percent] = buildShimmerClaimedStats("1450896407249092", "1450896407249092", TOKEN_INFO);
    expect(claimed).toBe("1,450,896,407 SMR");
    expect(percent).toBe("100%");
});

test("buildShimmerClaimedStats should display <0.01% on small fractions", () => {
    let [claimed, percent] = buildShimmerClaimedStats("1", "10009", TOKEN_INFO);
    expect(claimed).toBe("1 glow");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("5123123", "1450896407249092", TOKEN_INFO);
    expect(claimed).toBe("5.12 SMR");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("1", "10000", TOKEN_INFO);
    expect(claimed).toBe("1 glow");
    expect(percent).toBe("0.01%");
});

test("buildShimmerClaimedStats should display in glow for values <1000 glow", () => {
    let [claimed, percent] = buildShimmerClaimedStats("999", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("999 glow");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("1000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("0.001 SMR");
    expect(percent).toBe("<0.01%");
});

test("buildShimmerClaimedStats should show to three decimals for values 1000 glow < x < 1 SMR", () => {
    let [claimed, percent] = buildShimmerClaimedStats("9999", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("0.009 SMR");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("999999", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("0.999 SMR");
    expect(percent).toBe("0.06%");

    [claimed, percent] = buildShimmerClaimedStats("990000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("0.99 SMR");
    expect(percent).toBe("0.06%");
});

test("buildShimmerClaimedStats should show to two decimals for values 1 SMR < x < 100 SMR", () => {
    let [claimed, percent] = buildShimmerClaimedStats("9999999", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("9.99 SMR");
    expect(percent).toBe("0.68%");

    [claimed, percent] = buildShimmerClaimedStats("99899999", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("99.89 SMR");
    expect(percent).toBe("6.88%");

    [claimed, percent] = buildShimmerClaimedStats("199899999", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("199 SMR");
    expect(percent).toBe("13.77%");
});

test("buildShimmerClaimedStats should not display magnitudes, but SMR formatted with commas", () => {
    let [claimed, percent] = buildShimmerClaimedStats("1234198475", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("1,234 SMR");
    expect(percent).toBe("85.06%");

    [claimed, percent] = buildShimmerClaimedStats("1234198475000", "10000000000000", TOKEN_INFO);
    expect(claimed).toBe("1,234,198 SMR");
    expect(percent).toBe("12.34%");

    [claimed, percent] = buildShimmerClaimedStats("1234198475000000", "2000000000000000", TOKEN_INFO);
    expect(claimed).toBe("1,234,198,475 SMR");
    expect(percent).toBe("61.7%");

    [claimed, percent] = buildShimmerClaimedStats("1234198475000000000", "2000000000000000000", TOKEN_INFO);
    expect(claimed).toBe("1,234,198,475,000 SMR");
    expect(percent).toBe("61.7%");

    [claimed, percent] = buildShimmerClaimedStats("1276198475000000000000", "2000000000000000000000", TOKEN_INFO);
    expect(claimed).toBe("1,276,198,475,000,000 SMR");
    expect(percent).toBe("63.8%");

    [claimed, percent] = buildShimmerClaimedStats("1234198475000000000000000", "2000000000000000000000000", TOKEN_INFO);
    expect(claimed).toBe("1,234,198,475,000,000,000 SMR");
    expect(percent).toBe("61.7%");
});

test("buildShimmerClaimedStats should display shimmer launch", () => {
    let [claimed, percent] = buildShimmerClaimedStats("1", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("1 glow");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("10", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("10 glow");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("100", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("100 glow");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("1000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("0.001 SMR");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("13000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("0.013 SMR");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("100000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("0.1 SMR");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("123000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("0.123 SMR");
    expect(percent).toBe("<0.01%");

    [claimed, percent] = buildShimmerClaimedStats("1000000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("1 SMR");
    expect(percent).toBe("0.06%");

    [claimed, percent] = buildShimmerClaimedStats("1230000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("1.23 SMR");
    expect(percent).toBe("0.08%");

    [claimed, percent] = buildShimmerClaimedStats("10000000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("10 SMR");
    expect(percent).toBe("0.68%");

    [claimed, percent] = buildShimmerClaimedStats("12346000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("12.34 SMR");
    expect(percent).toBe("0.85%");

    [claimed, percent] = buildShimmerClaimedStats("100999000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("100 SMR");
    expect(percent).toBe("6.96%");

    [claimed, percent] = buildShimmerClaimedStats("1234000000", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("1,234 SMR");
    expect(percent).toBe("85.05%");

    [claimed, percent] = buildShimmerClaimedStats("1450896407", "1450896407", TOKEN_INFO);
    expect(claimed).toBe("1,450 SMR");
    expect(percent).toBe("100%");
});
