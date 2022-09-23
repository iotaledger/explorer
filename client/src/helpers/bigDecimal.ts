export class BigDecimal {
    public static DECIMALS = 6; // number of decimals on all instances

    public static ROUNDED = false; // numbers are truncated (false) or rounded (true)

    private readonly num: bigint;

    constructor(value: string) {
        const [ints, decis] = value.split(".").concat("");
        this.num = BigInt(ints + decis.padEnd(BigDecimal.DECIMALS, "0").slice(0, BigDecimal.DECIMALS)) +
            BigInt(BigDecimal.ROUNDED && decis[BigDecimal.DECIMALS] >= "5");
    }

    public static fromBigInt(bigint: bigint): BigDecimal {
        return Object.assign(Object.create(BigDecimal.prototype), { num: bigint }) as BigDecimal;
    }

    public static divRound(dividend: bigint, divisor: bigint): BigDecimal {
        return BigDecimal.fromBigInt((dividend / divisor) + (BigDecimal.ROUNDED ? dividend * 2n / divisor % 2n : 0n));
    }

    public add(num: string): BigDecimal {
        return BigDecimal.fromBigInt(this.num + new BigDecimal(num).num);
    }

    public subtract(num: string): BigDecimal {
        return BigDecimal.fromBigInt(this.num - new BigDecimal(num).num);
    }

    public multiply(num: string): BigDecimal {
        const shift = BigInt(`1${"0".repeat(BigDecimal.DECIMALS)}`);
        return BigDecimal.divRound(this.num * new BigDecimal(num).num, shift);
    }

    public divide(num: string): BigDecimal {
        const shift = BigInt(`1${"0".repeat(BigDecimal.DECIMALS)}`);
        return BigDecimal.divRound(this.num * shift, new BigDecimal(num).num);
    }

    public toString(): string {
        const s = this.num.toString().padStart(BigDecimal.DECIMALS + 1, "0");
        const whole = s.slice(0, -BigDecimal.DECIMALS);
        const frac = s.slice(-BigDecimal.DECIMALS);
        const hasFrac = Number(frac) !== 0;
        return whole + (hasFrac ? "." : "") + frac.replace(/\.?0+$/, "");
    }
}
