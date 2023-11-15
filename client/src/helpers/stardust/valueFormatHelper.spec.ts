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

    it("Number less than 1000000", () => {
        expect(formatAmount(1000, tokenInfo)).toBe("0.001 IOTA");
    });
    it("Number 1", () => {
        expect(formatAmount(1, tokenInfo)).toBe("0.000001 IOTA");
    });
    it("Max Number", () => {
        expect(formatAmount(1450896407249092, tokenInfo)).toBe("1450896407.24 IOTA");
    });
});
