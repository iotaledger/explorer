export class NumberHelper {
  /**
   * Get the number rounded to n decimals.
   * @param number The number to get rounded.
   * @param decimals The number of decimals.
   * @returns The number rounded.
   */
  public static roundTo(number: number, decimals: number): number {
    return Math.round(number * 10 * decimals) / (10 * decimals);
  }

  public static isNumeric(value: string): boolean {
    return /^-?\d+$/.test(value);
  }
}
