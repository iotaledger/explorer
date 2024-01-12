import { formatAmount } from "./valueFormatHelper";

const tokenInfo = {
    "name": "IOTA",
    "tickerSymbol": "IOTA",
    "unit": "IOTA",
    "subunit": "micro",
    "decimals": 6,
    "useMetricPrefix": false
};

test("formatAmount should format 1 subunit properly", () => {
    expect(formatAmount(1, tokenInfo)).toBe("0.000001 IOTA");
});

test("formatAmount should format 10 subunit properly", () => {
    expect(formatAmount(10, tokenInfo)).toBe("0.00001 IOTA");
});

test("formatAmount should format 100 subunit properly", () => {
    expect(formatAmount(100, tokenInfo)).toBe("0.0001 IOTA");
});

test("formatAmount should format 1000 subunit properly", () => {
    expect(formatAmount(1000, tokenInfo)).toBe("0.001 IOTA");
});

test("formatAmount should format 10000 subunit properly", () => {
    expect(formatAmount(10000, tokenInfo)).toBe("0.01 IOTA");
});

test("formatAmount should format 100000 subunit properly", () => {
    expect(formatAmount(100000, tokenInfo)).toBe("0.1 IOTA");
});

test("formatAmount should format 1 unit properly", () => {
    expect(formatAmount(1000000, tokenInfo)).toBe("1 IOTA");
});

test("formatAmount should format 1 unit with fraction properly", () => {
    expect(formatAmount(1234567, tokenInfo)).toBe("1.23 IOTA");
});

test("formatAmount should handle edge case from issue 'explorer/issues/822'", () => {
    expect(formatAmount(1140000, tokenInfo)).toBe("1.14 IOTA");
});

test("formatAmount should honour precision 3", () => {
    expect(formatAmount(9999, tokenInfo, false, 3)).toBe("0.009 IOTA");
});

test("formatAmount should honour precision 4", () => {
    expect(formatAmount(9999, tokenInfo, false, 4)).toBe("0.0099 IOTA");
});

test("formatAmount should honour precision 0", () => {
    expect(formatAmount(1450896407249092, tokenInfo, false, 0)).toBe("1450896407 IOTA");
});

test("formatAmount should format big values properly", () => {
    expect(formatAmount(1450896407249092, tokenInfo)).toBe("1450896407.24 IOTA");
});

