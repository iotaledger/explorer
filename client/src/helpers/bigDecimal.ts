export default class BigDecimal {
    /*
     * Number of decimals to use throughout.
     * Also propagates to "other" values used in operations.
     */
    private readonly decimals: number;

    /**
     * Should the decimals be rounded or truncated.
     */
    private readonly rounded: boolean;

    /**
     * The n BigInt.
     */
    private readonly n: bigint;

    constructor(value: string, decimals = 2, rounded = false) {
        const [whole, fraction] = value.split(".").concat("");
        this.decimals = decimals;
        this.rounded = rounded;
        this.n =
            BigInt(whole + fraction.padEnd(this.decimals, "0").slice(0, this.decimals)) +
            BigInt(this.rounded && fraction[this.decimals] >= "5");
    }

    public static fromBigInt(bigint: bigint, decimals = 0, rounded = false): BigDecimal {
        return Object.assign(Object.create(BigDecimal.prototype), { n: bigint, decimals, rounded }) as BigDecimal;
    }

    public divRound(dividend: bigint, divisor: bigint): BigDecimal {
        return BigDecimal.fromBigInt(
            dividend / divisor + (this.rounded ? ((dividend * 2n) / divisor) % 2n : 0n),
            this.decimals,
            this.rounded,
        );
    }

    public add(other: string): BigDecimal {
        return BigDecimal.fromBigInt(this.n + new BigDecimal(other, this.decimals, this.rounded).n, this.decimals, this.rounded);
    }

    public subtract(other: string): BigDecimal {
        return BigDecimal.fromBigInt(this.n - new BigDecimal(other, this.decimals, this.rounded).n, this.decimals, this.rounded);
    }

    public multiply(other: string): BigDecimal {
        const shift = BigInt(`1${"0".repeat(this.decimals)}`);
        return this.divRound(this.n * new BigDecimal(other, this.decimals, this.rounded).n, shift);
    }

    public divide(other: string): BigDecimal {
        const shift = BigInt(`1${"0".repeat(this.decimals)}`);
        return this.divRound(this.n * shift, new BigDecimal(other, this.decimals, this.rounded).n);
    }

    public toString(): string {
        let negative = false;
        let s = this.n.toString();

        if (s.startsWith("-")) {
            negative = true;
            s = s.slice(1);
        }

        const padded = s.padStart(this.decimals + 1, "0");
        const whole = this.decimals === 0 ? padded : padded.slice(0, -this.decimals);
        const frac = this.decimals === 0 ? "" : padded.slice(-this.decimals);
        const hasFrac = Number(frac) !== 0;
        return (negative ? "-" : "") + whole + (hasFrac ? "." : "") + frac.replace(/\.?0+$/, "");
    }
}
