declare module "curl.lib.js" {
    export function init(): void;
    export function pow({ trytes: string, minWeight: number}): Promise<string>;
}
