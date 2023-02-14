import { TransactionsHelper } from "./transactionsHelper";

describe("Transaction helper", () => {
    it("should convert little endian encoded hex to big endian", () => {
        const outputIndex = "0200";
        expect(TransactionsHelper.convertToBigEndian(outputIndex)).toBe("0002");
    });
});
