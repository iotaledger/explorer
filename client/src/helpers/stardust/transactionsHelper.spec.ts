import { TransactionsHelper } from "./transactionsHelper";

describe("Transaction helper", () => {
    it("should convert little endian encoded hex to big endian", () => {
        const outputIndex = "0200";
        expect(TransactionsHelper.convertToBigEndian(outputIndex)).toBe("0002");
    });

    it("should convert to big endian when the index length is 6", () => {
        const outputIndex = "9F8601";
        expect(TransactionsHelper.convertToBigEndian(outputIndex)).toBe("01869F");
    });

    it("should convert to big endian when the index length is 8", () => {
        const outputIndex = "9F860101";
        expect(TransactionsHelper.convertToBigEndian(outputIndex)).toBe("0101869F");
    });

    it("should convert to big endian if the index has odd length", () => {
        const outputIndex = "9F86010";
        expect(TransactionsHelper.convertToBigEndian(outputIndex)).toBe("1060F809");
    });
});
