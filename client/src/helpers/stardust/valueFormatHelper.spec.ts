export {};
import { formatAmount } from "./valueFormatHelper";

const tokenInfo = {
    "name": "IOTA",
    "tickerSymbol": "IOTA",
    "unit": "IOTA",
    "subunit": "micro",
    "decimals": 6,
    "useMetricPrefix": false
};

describe("valueFormatHelper tests", () => {
    it("1.14 edge case", () => {
        expect(formatAmount(1140000, tokenInfo)).toBe("1.14 IOTA");
    });
    it("Number 1 (less than 1_000_000)", () => {
        expect(formatAmount(1, tokenInfo)).toBe("0.000001 IOTA");
    });
    it("Number 10 (less than 1_000_000) - minimum", () => {
        expect(formatAmount(10, tokenInfo)).toBe("0.00001 IOTA");
    });
    it("Number 100 (less than 1_000_000)", () => {
        expect(formatAmount(100, tokenInfo)).toBe("0.0001 IOTA");
    });
    it("Number 1000 (less than 1_000_000)", () => {
        expect(formatAmount(1000, tokenInfo)).toBe("0.001 IOTA");
    });
    it("Number 10000 (less than 1_000_000)", () => {
        expect(formatAmount(10000, tokenInfo)).toBe("0.01 IOTA");
    });
    it("Number 100000 (less than 1_000_000)", () => {
        expect(formatAmount(100000, tokenInfo)).toBe("0.1 IOTA");
    });
    it("Number 1000000", () => {
        expect(formatAmount(1000000, tokenInfo)).toBe("1 IOTA");
    });

    it("Without Less zero", () => {
        expect(formatAmount(9999, tokenInfo, false, 3)).toBe("0.009 IOTA");
    });
    it("With 0 decimal", () => {
        expect(formatAmount(1450896407249092, tokenInfo, false, 0)).toBe("1450896407 IOTA");
    });

    it("Max Number", () => {
        expect(formatAmount(1450896407249092, tokenInfo)).toBe("1450896407.24 IOTA");
    });
});
