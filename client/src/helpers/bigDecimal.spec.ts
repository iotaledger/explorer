import BigDecimal from "./bigDecimal";

describe("BigDecimal", () => {
    it("should construct with whole", () => {
        expect(new BigDecimal("0").toString()).toBe("0");
        expect(new BigDecimal("999").toString()).toBe("999");
    });

    it("should construct with decimal", () => {
        expect(new BigDecimal("0.12345").toString()).toBe("0.12");
    });

    it("should construct from big int", () => {
        expect(BigDecimal.fromBigInt(BigInt("11234")).toString()).toBe("11234");
        expect(BigDecimal.fromBigInt(BigInt(11234)).toString()).toBe("11234");
        expect(BigDecimal.fromBigInt(BigInt(BigInt(11234))).toString()).toBe("11234");
        expect(BigDecimal.fromBigInt(BigInt(true)).toString()).toBe("1");
        expect(BigDecimal.fromBigInt(BigInt(false)).toString()).toBe("0");
        // with fraction
        expect(BigDecimal.fromBigInt(BigInt("112301"), 4).toString()).toBe("11.2301");
    });

    it("should round properly", () => {
        expect(new BigDecimal("12345", 10, true).toString()).toBe("12345");
        expect(new BigDecimal("12345", 10, false).toString()).toBe("12345");
        expect(new BigDecimal("12345.12345678", 4, false).toString()).toBe("12345.1234");
        expect(new BigDecimal("12345.12344678", 4, true).toString()).toBe("12345.1234");
        expect(new BigDecimal("12345.12345678", 4, true).toString()).toBe("12345.1235");
        expect(new BigDecimal("12345.12345678", 2, true).toString()).toBe("12345.12");
        expect(new BigDecimal("12345.12345678", 2, false).toString()).toBe("12345.12");
        expect(new BigDecimal("12345.12545678", 2, true).toString()).toBe("12345.13");
        expect(new BigDecimal("12345.12545678", 2, false).toString()).toBe("12345.12");
    });

    it("should perform addition", () => {
        let from = new BigDecimal("1.12645");
        let res = from.add("100999");
        expect(res.toString()).toBe("101000.12");

        from = new BigDecimal("999000");
        res = from.add("1000");
        expect(res.toString()).toBe("1000000");
        expect(res.add("5.123456").toString()).toBe("1000005.12");

        // rounded = true
        from = new BigDecimal("1.12645", 2, true);
        res = from.add("100999");
        expect(res.toString()).toBe("101000.13");
    });

    it("should perform subtraction", () => {
        let from = new BigDecimal("1.12567");
        let res = from.subtract("100999");
        expect(res.toString()).toBe("-100997.88");

        from = new BigDecimal("999000");
        res = from.subtract("1000");
        expect(res.toString()).toBe("998000");
        expect(res.subtract("5.12789").toString()).toBe("997994.88");

        // rounded = true
        from = new BigDecimal("1.12567", 2, true);
        res = from.subtract("100999");
        expect(res.toString()).toBe("-100997.87");
    });

    it("should perform multiplication", () => {
        let from = new BigDecimal("1000123321");
        const res = from.multiply("20000");
        expect(res.toString()).toBe("20002466420000");

        from = new BigDecimal("10.49582");
        expect(from.multiply("5.928371").toString()).toBe("62.1");

        from = new BigDecimal("10.49582");
        expect(from.multiply("-5.928371").toString()).toBe("-62.1");

        //  rounded = true
        from = new BigDecimal("10.49582", 2, true);
        expect(from.multiply("5.928371").toString()).toBe("62.27");
    });

    it("should perform division", () => {
        let from = new BigDecimal("1000123321");
        const res = from.divide("20000");

        expect(res.toString()).toBe("50006.16");

        from = new BigDecimal("10.49582");
        expect(from.divide("5.928371").toString()).toBe("1.77");
        expect(from.divide("5.924371").toString()).toBe("1.77");
    });
});
