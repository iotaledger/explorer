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

        test("should honour format full (number)", () => {
            expect(formatAmount(1, tokenInfo, true)).toBe("1 micro");
        });
    });

    describe("with bigint values", () => {
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

        test("should honour format full (bigint)", () => {
            expect(formatAmount(1n, tokenInfo, true)).toBe("1 micro");
        });
    });

    describe("with string values", () => {
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

        test("should honour format full (number)", () => {
            expect(formatAmount("1", tokenInfo, true)).toBe("1 micro");
        });
    });

    describe("with undefined values", () => {
        test("should not break with Number undefined", () => {
            expect(formatAmount(Number(undefined), tokenInfo)).toBe("");
        });

        test("should not break with Number null", () => {
            expect(formatAmount(Number(null), tokenInfo)).toBe("");
        });

        test("should not break with String undefined", () => {
            expect(formatAmount(String(undefined), tokenInfo)).toBe("");
        });

        test("should not break with String null", () => {
            expect(formatAmount(String(null), tokenInfo)).toBe("");
        });
    });
});
