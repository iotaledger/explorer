// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable no-bitwise */
/* eslint-disable no-mixed-operators */
/* eslint-disable unicorn/number-literal-case */

/**
 * Class to help with Blake2B Signature scheme.
 * TypeScript conversion from https://github.com/dcposch/blakejs.
 */
export class Blake2b {
    /**
     * Blake2b 160.
     */
    public static SIZE_160: number = 20;

    /**
     * Blake2b 256.
     */
    public static SIZE_256: number = 32;

    /**
     * Blake2b 512.
     */
    public static SIZE_512: number = 64;

    /**
     * Initialization Vector.
     * @internal
     */
    private static readonly BLAKE2B_IV32 = new Uint32Array([
        0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85, 0xfe94f82b, 0x3c6ef372, 0x5f1d36f1, 0xa54ff53a, 0xade682d1, 0x510e527f, 0x2b3e6c1f,
        0x9b05688c, 0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19,
    ]);

    /**
     * Initialization Vector.
     * @internal
     */
    private static readonly SIGMA8 = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15,
        13, 10, 14, 3, 6, 7, 1, 9, 4, 7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8,
        3, 13, 2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9, 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11, 13, 11, 7, 14,
        12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10, 6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5, 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14,
        3, 12, 13, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
    ];

    /**
     * These are offsets into a uint64 buffer.
     * Multiply them all by 2 to make them offsets into a uint32 buffer,
     * because this is Javascript and we don't have uint64s
     * @internal
     */
    private static readonly SIGMA82 = new Uint8Array(Blake2b.SIGMA8.map((x) => x * 2));

    /**
     * The V vector.
     * @internal
     */
    private _v: Uint32Array;

    /**
     * The M vector.
     * @internal
     */
    private _m: Uint32Array;

    /**
     * The context for the current hash.
     * @internal
     */
    private readonly _context: {
        b: Uint8Array;
        h: Uint32Array;
        t: number;
        c: number;
        outlen: number;
    };

    /**
     * Create a new instance of Blake2b.
     * @param outlen Output length between 1 and 64 bytes.
     * @param key Optional key.
     */
    constructor(outlen: number, key?: Uint8Array) {
        this._v = new Uint32Array(32);
        this._m = new Uint32Array(32);
        this._context = {
            b: new Uint8Array(128),
            h: new Uint32Array(16),
            t: 0, // input count
            c: 0, // pointer within buffer
            outlen, // output length in bytes
        };
        this.init(outlen, key);
    }

    /**
     * Perform Sum 160 on the data.
     * @param data The data to operate on.
     * @param key Optional key for the hash.
     * @returns The sum 160 of the data.
     */
    public static sum160(data: Uint8Array, key?: Uint8Array): Uint8Array {
        const b2b = new Blake2b(Blake2b.SIZE_160, key);
        b2b.update(data);
        return b2b.final();
    }

    /**
     * Perform Sum 256 on the data.
     * @param data The data to operate on.
     * @param key Optional key for the hash.
     * @returns The sum 256 of the data.
     */
    public static sum256(data: Uint8Array, key?: Uint8Array): Uint8Array {
        const b2b = new Blake2b(Blake2b.SIZE_256, key);
        b2b.update(data);
        return b2b.final();
    }

    /**
     * Perform Sum 512 on the data.
     * @param data The data to operate on.
     * @param key Optional key for the hash.
     * @returns The sum 512 of the data.
     */
    public static sum512(data: Uint8Array, key?: Uint8Array): Uint8Array {
        const b2b = new Blake2b(Blake2b.SIZE_512, key);
        b2b.update(data);
        return b2b.final();
    }

    /**
     * Updates a BLAKE2b streaming hash.
     * @param input The data to hash.
     */
    public update(input: Uint8Array): void {
        for (let i = 0; i < input.length; i++) {
            if (this._context.c === 128) {
                // buffer full ?
                this._context.t += this._context.c; // add counters
                this.compress(false); // compress (not last)
                this._context.c = 0; // counter to zero
            }
            this._context.b[this._context.c++] = input[i];
        }
    }

    /**
     * Completes a BLAKE2b streaming hash.
     * @returns The final data.
     */
    public final(): Uint8Array {
        this._context.t += this._context.c; // mark last block offset

        while (this._context.c < 128) {
            // fill up with zeros
            this._context.b[this._context.c++] = 0;
        }
        this.compress(true); // final block flag = 1

        // little endian convert and store
        const out = new Uint8Array(this._context.outlen);
        for (let i = 0; i < this._context.outlen; i++) {
            out[i] = this._context.h[i >> 2] >> (8 * (i & 3));
        }
        return out;
    }

    /**
     * Creates a BLAKE2b hashing context.
     * @param outlen Output length between 1 and 64 bytes.
     * @param key Optional key.
     */
    private init(outlen: number, key?: Uint8Array): void {
        if (outlen <= 0 || outlen > 64) {
            throw new Error("Illegal output length, expected 0 < length <= 64");
        }
        if (key && key.length > 64) {
            throw new Error("Illegal key, expected Uint8Array with 0 < length <= 64");
        }

        // initialize hash state
        for (let i = 0; i < 16; i++) {
            this._context.h[i] = Blake2b.BLAKE2B_IV32[i];
        }
        const keylen = key ? key.length : 0;
        this._context.h[0] ^= 0x01010000 ^ (keylen << 8) ^ outlen;

        // key the hash, if applicable
        if (key) {
            this.update(key);
            // at the end
            this._context.c = 128;
        }
    }

    /**
     * Compression.
     * Note we're representing 16 uint64s as 32 uint32s
     * @param last Is this the last block.
     * @internal
     */
    private compress(last: boolean): void {
        let i = 0;

        // init work variables
        for (i = 0; i < 16; i++) {
            this._v[i] = this._context.h[i];
            this._v[i + 16] = Blake2b.BLAKE2B_IV32[i];
        }

        // low 64 bits of offset
        this._v[24] ^= this._context.t;
        this._v[25] ^= this._context.t / 0x100000000;
        // high 64 bits not supported, offset may not be higher than 2**53-1

        // last block flag set ?
        if (last) {
            this._v[28] = ~this._v[28];
            this._v[29] = ~this._v[29];
        }

        // get little-endian words
        for (i = 0; i < 32; i++) {
            this._m[i] = this.b2bGet32(this._context.b, 4 * i);
        }

        // twelve rounds of mixing
        for (i = 0; i < 12; i++) {
            this.b2bG(0, 8, 16, 24, Blake2b.SIGMA82[i * 16 + 0], Blake2b.SIGMA82[i * 16 + 1]);
            this.b2bG(2, 10, 18, 26, Blake2b.SIGMA82[i * 16 + 2], Blake2b.SIGMA82[i * 16 + 3]);
            this.b2bG(4, 12, 20, 28, Blake2b.SIGMA82[i * 16 + 4], Blake2b.SIGMA82[i * 16 + 5]);
            this.b2bG(6, 14, 22, 30, Blake2b.SIGMA82[i * 16 + 6], Blake2b.SIGMA82[i * 16 + 7]);
            this.b2bG(0, 10, 20, 30, Blake2b.SIGMA82[i * 16 + 8], Blake2b.SIGMA82[i * 16 + 9]);
            this.b2bG(2, 12, 22, 24, Blake2b.SIGMA82[i * 16 + 10], Blake2b.SIGMA82[i * 16 + 11]);
            this.b2bG(4, 14, 16, 26, Blake2b.SIGMA82[i * 16 + 12], Blake2b.SIGMA82[i * 16 + 13]);
            this.b2bG(6, 8, 18, 28, Blake2b.SIGMA82[i * 16 + 14], Blake2b.SIGMA82[i * 16 + 15]);
        }

        for (i = 0; i < 16; i++) {
            this._context.h[i] = this._context.h[i] ^ this._v[i] ^ this._v[i + 16];
        }
    }

    /**
     * 64-bit unsigned addition
     * Sets v[a,a+1] += v[b,b+1]
     * @param v The array.
     * @param a The a index.
     * @param b The b index.
     * @internal
     */
    private add64AA(v: Uint32Array, a: number, b: number): void {
        const o0 = v[a] + v[b];
        let o1 = v[a + 1] + v[b + 1];
        if (o0 >= 0x100000000) {
            o1++;
        }
        v[a] = o0;
        v[a + 1] = o1;
    }

    /**
     * 64-bit unsigned addition.
     * Sets v[a,a+1] += b.
     * @param v The array of data to work on.
     * @param a The index to use.
     * @param b0 Is the low 32 bits.
     * @param b1 Represents the high 32 bits.
     * @internal
     */
    private add64AC(v: Uint32Array, a: number, b0: number, b1: number): void {
        let o0 = v[a] + b0;
        if (b0 < 0) {
            o0 += 0x100000000;
        }
        let o1 = v[a + 1] + b1;
        if (o0 >= 0x100000000) {
            o1++;
        }
        v[a] = o0;
        v[a + 1] = o1;
    }

    /**
     * Little endian read byte 32;
     * @param arr The array to read from .
     * @param i The index to start reading from.
     * @returns The value.
     * @internal
     */
    private b2bGet32(arr: ArrayLike<number>, i: number): number {
        return arr[i] ^ (arr[i + 1] << 8) ^ (arr[i + 2] << 16) ^ (arr[i + 3] << 24);
    }

    /**
     * G Mixing function.
     * The ROTRs are inlined for speed.
     * @param a The a value.
     * @param b The b value.
     * @param c The c value.
     * @param d The d value.
     * @param ix The ix value.
     * @param iy The iy value.
     * @internal
     */
    private b2bG(a: number, b: number, c: number, d: number, ix: number, iy: number): void {
        const x0 = this._m[ix];
        const x1 = this._m[ix + 1];
        const y0 = this._m[iy];
        const y1 = this._m[iy + 1];

        this.add64AA(this._v, a, b); // v[a,a+1] += v[b,b+1] ... in JS we must store a uint64 as two uint32s
        this.add64AC(this._v, a, x0, x1); // v[a, a+1] += x ... x0 is the low 32 bits of x, x1 is the high 32 bits

        // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
        let xor0 = this._v[d] ^ this._v[a];
        let xor1 = this._v[d + 1] ^ this._v[a + 1];
        this._v[d] = xor1;
        this._v[d + 1] = xor0;

        this.add64AA(this._v, c, d);

        // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
        xor0 = this._v[b] ^ this._v[c];
        xor1 = this._v[b + 1] ^ this._v[c + 1];
        this._v[b] = (xor0 >>> 24) ^ (xor1 << 8);
        this._v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);

        this.add64AA(this._v, a, b);
        this.add64AC(this._v, a, y0, y1);

        // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
        xor0 = this._v[d] ^ this._v[a];
        xor1 = this._v[d + 1] ^ this._v[a + 1];
        this._v[d] = (xor0 >>> 16) ^ (xor1 << 16);
        this._v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);

        this.add64AA(this._v, c, d);

        // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
        xor0 = this._v[b] ^ this._v[c];
        xor1 = this._v[b + 1] ^ this._v[c + 1];
        this._v[b] = (xor1 >>> 31) ^ (xor0 << 1);
        this._v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
    }
}
