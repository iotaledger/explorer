import { formatAmount } from "./valueFormatHelper";

const tokenInfo = {
    name: "IOTA",
    tickerSymbol: "IOTA",
    unit: "IOTA",
    subunit: "micro",
    decimals: 6,
    useMetricPrefix: false,
};

describe("formatAmount", () => {
    describe("with number values", () => {
        test("should format 0 subunit properly", () => {
            expect(formatAmount(0, tokenInfo)).toBe("0 IOTA");
        });

        test("should format 1 subunit properly", () => {
            expect(formatAmount(1, tokenInfo)).toBe("0.000001 IOTA");
        });

        test("should format 10 subunit properly", () => {
            expect(formatAmount(10, tokenInfo)).toBe("0.00001 IOTA");
        });

        test("should format 100 subunit properly", () => {
            expect(formatAmount(100, tokenInfo)).toBe("0.0001 IOTA");
        });

        test("should format 1000 subunit properly", () => {
            expect(formatAmount(1000, tokenInfo)).toBe("0.001 IOTA");
        });

        test("should format 10000 subunit properly", () => {
            expect(formatAmount(10000, tokenInfo)).toBe("0.01 IOTA");
        });

        test("should format 100000 subunit properly", () => {
            expect(formatAmount(100000, tokenInfo)).toBe("0.1 IOTA");
        });

        test("should format 1 unit properly", () => {
            expect(formatAmount(1000000, tokenInfo)).toBe("1 IOTA");
        });

        test("should format 1 unit with fraction properly", () => {
            expect(formatAmount(1234567, tokenInfo)).toBe("1.23 IOTA");
        });

        test("should format 1 unit with trailing decimals properly", () => {
            expect(formatAmount(1000000, tokenInfo, false, 2, true)).toBe("1.00 IOTA");
        });

        test("should handle edge case from issue 'explorer/issues/822'", () => {
            expect(formatAmount(1140000, tokenInfo)).toBe("1.14 IOTA");
        });

        test("should honour precision 3", () => {
            expect(formatAmount(9999, tokenInfo, false, 3)).toBe("0.009 IOTA");
        });

        test("should honour precision 4", () => {
            expect(formatAmount(9999, tokenInfo, false, 4)).toBe("0.0099 IOTA");
        });

        test("should honour precision 0", () => {
            expect(formatAmount(1450896407249092, tokenInfo, false, 0)).toBe("1450896407 IOTA");
        });

        test("should format big values properly", () => {
            expect(formatAmount(1450896407249092, tokenInfo)).toBe("1450896407.24 IOTA");
        });

        test("should honour 2 decimals arg even if has tailing decimals: format 6500004000 -> (6500.00 instead of 6500.004)", () => {
            expect(formatAmount(6500004000, tokenInfo, false, 2, true)).toBe("6500.00 IOTA");
        });

        test("should honour 3 decimal arg even if has tailing decimals: format 6500000400 -> (6500.000 instead of 6500.0004)", () => {
            expect(formatAmount(6500000400, tokenInfo, false, 3, true)).toBe("6500.000 IOTA");
        });

        test("should honour format full (number)", () => {
            expect(formatAmount(1, tokenInfo, true)).toBe("1 micro");
        });

        test("should not break with negative value", () => {
            expect(formatAmount(-2193144968, tokenInfo)).toBe("-2193.14 IOTA");
        });

        test("should not break with negative decimal value", () => {
            expect(formatAmount(-2144, tokenInfo)).toBe("-0.002144 IOTA");
        });
    });

    describe("with bigint values", () => {
        test("should format 0 subunit properly", () => {
            expect(formatAmount(0n, tokenInfo)).toBe("0 IOTA");
        });

        test("should format 1 subunit properly", () => {
            expect(formatAmount(1n, tokenInfo)).toBe("0.000001 IOTA");
        });

        test("should format 10 subunit properly", () => {
            expect(formatAmount(10n, tokenInfo)).toBe("0.00001 IOTA");
        });

        test("should format 100 subunit properly", () => {
            expect(formatAmount(100n, tokenInfo)).toBe("0.0001 IOTA");
        });

        test("should format 1000 subunit properly", () => {
            expect(formatAmount(1000n, tokenInfo)).toBe("0.001 IOTA");
        });

        test("should format 10000 subunit properly", () => {
            expect(formatAmount(10000n, tokenInfo)).toBe("0.01 IOTA");
        });

        test("should format 100000 subunit properly", () => {
            expect(formatAmount(100000n, tokenInfo)).toBe("0.1 IOTA");
        });

        test("should format 1 unit properly", () => {
            expect(formatAmount(1000000n, tokenInfo)).toBe("1 IOTA");
        });

        test("should format 1 unit with fraction properly", () => {
            expect(formatAmount(1234567n, tokenInfo)).toBe("1.23 IOTA");
        });

        test("should format 1 unit with trailing decimals properly", () => {
            expect(formatAmount(1000000n, tokenInfo, false, 2, true)).toBe("1.00 IOTA");
        });

        test("should handle edge case from issue 'explorer/issues/822'", () => {
            expect(formatAmount(1140000n, tokenInfo)).toBe("1.14 IOTA");
        });

        test("should honour precision 3", () => {
            expect(formatAmount(9999n, tokenInfo, false, 3)).toBe("0.009 IOTA");
        });

        test("should honour precision 4", () => {
            expect(formatAmount(9999n, tokenInfo, false, 4)).toBe("0.0099 IOTA");
        });

        test("should honour precision 0", () => {
            expect(formatAmount(1450896407249092n, tokenInfo, false, 0)).toBe("1450896407 IOTA");
        });

        test("should format big values properly", () => {
            expect(formatAmount(1450896407249092n, tokenInfo)).toBe("1450896407.24 IOTA");
        });

        test("should not break formatting a bigint over Number.MAX_SAFE_INTEGER", () => {
            expect(formatAmount(9007199254740993n, tokenInfo)).toBe("9007199254.74 IOTA");
        });

        test("should honour 2 decimals arg even if has tailing decimals: format 6500004000 -> (6500.00 instead of 6500.004)", () => {
            expect(formatAmount(6500004000n, tokenInfo, false, 2, true)).toBe("6500.00 IOTA");
        });

        test("should honour 3 decimal arg even if has tailing decimals: format 6500000400 -> (6500.000 instead of 6500.0004)", () => {
            expect(formatAmount(6500000400n, tokenInfo, false, 3, true)).toBe("6500.000 IOTA");
        });

        test("should honour format full (bigint)", () => {
            expect(formatAmount(1n, tokenInfo, true)).toBe("1 micro");
        });

        test("should not break with negative value", () => {
            expect(formatAmount(-2193144968n, tokenInfo)).toBe("-2193.14 IOTA");
        });

        test("should not break with negative decimal value", () => {
            expect(formatAmount(-2144n, tokenInfo)).toBe("-0.002144 IOTA");
        });
    });

    describe("with string values", () => {
        test("should format 0 subunit properly", () => {
            expect(formatAmount("0", tokenInfo)).toBe("0 IOTA");
        });

        test("should format 1 subunit properly", () => {
            expect(formatAmount("1", tokenInfo)).toBe("0.000001 IOTA");
        });

        test("should format 10 subunit properly", () => {
            expect(formatAmount("10", tokenInfo)).toBe("0.00001 IOTA");
        });

        test("should format 100 subunit properly", () => {
            expect(formatAmount("100", tokenInfo)).toBe("0.0001 IOTA");
        });

        test("should format 1000 subunit properly", () => {
            expect(formatAmount("1000", tokenInfo)).toBe("0.001 IOTA");
        });

        test("should format 10000 subunit properly", () => {
            expect(formatAmount("10000", tokenInfo)).toBe("0.01 IOTA");
        });

        test("should format 100000 subunit properly", () => {
            expect(formatAmount("100000", tokenInfo)).toBe("0.1 IOTA");
        });

        test("should format 1 unit properly", () => {
            expect(formatAmount("1000000", tokenInfo)).toBe("1 IOTA");
        });

        test("should format 1 unit with fraction properly", () => {
            expect(formatAmount("1234567", tokenInfo)).toBe("1.23 IOTA");
        });

        test("should format 1 unit with trailing decimals properly", () => {
            expect(formatAmount("1000000", tokenInfo, false, 2, true)).toBe("1.00 IOTA");
        });

        test("should handle edge case from issue 'explorer/issues/822'", () => {
            expect(formatAmount("1140000", tokenInfo)).toBe("1.14 IOTA");
        });

        test("should honour precision 3", () => {
            expect(formatAmount("9999", tokenInfo, false, 3)).toBe("0.009 IOTA");
        });

        test("should honour precision 4", () => {
            expect(formatAmount("9999", tokenInfo, false, 4)).toBe("0.0099 IOTA");
        });

        test("should honour precision 0", () => {
            expect(formatAmount("1450896407249092", tokenInfo, false, 0)).toBe("1450896407 IOTA");
        });

        test("should format big values properly", () => {
            expect(formatAmount("1450896407249092", tokenInfo)).toBe("1450896407.24 IOTA");
        });

        test("should not break formatting a bigint over Number.MAX_SAFE_INTEGER", () => {
            expect(formatAmount("9007199254740993", tokenInfo)).toBe("9007199254.74 IOTA");
        });

        test("should honour 2 decimals arg even if has tailing decimals: format 6500004000 -> (6500.00 instead of 6500.004)", () => {
            expect(formatAmount("6500004000", tokenInfo, false, 2, true)).toBe("6500.00 IOTA");
        });

        test("should honour 3 decimal arg even if has tailing decimals: format 6500000400 -> (6500.000 instead of 6500.0004)", () => {
            expect(formatAmount("6500000400", tokenInfo, false, 3, true)).toBe("6500.000 IOTA");
        });

        test("should honour format full (number)", () => {
            expect(formatAmount("1", tokenInfo, true)).toBe("1 micro");
        });

        test("should not break with negative value", () => {
            expect(formatAmount("-2193144968", tokenInfo)).toBe("-2193.14 IOTA");
        });

        test("should not break with negative decimal value", () => {
            expect(formatAmount("-2144", tokenInfo)).toBe("-0.002144 IOTA");
        });
    });

    describe("with undefined values", () => {
        test("should not break with Number undefined", () => {
            expect(formatAmount(Number(undefined), tokenInfo)).toBe("");
        });

        test("should not break with Number null", () => {
            expect(formatAmount(Number(null), tokenInfo)).toBe("0 IOTA");
        });

        test("should not break with String undefined", () => {
            expect(formatAmount(String(undefined), tokenInfo)).toBe("");
        });

        test("should not break with String null", () => {
            expect(formatAmount(String(null), tokenInfo)).toBe("");
        });

        test("should not break with empty String", () => {
            expect(formatAmount("", tokenInfo)).toBe("");
        });
    });
});
