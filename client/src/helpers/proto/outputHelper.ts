import { Output, OutputType, OutputTypeName, IAliasOutput, ISigLockedColoredOutput, ISigLockedSingleOutput, IExtendedLockedOutput } from "@iota/protonet.js";

const IOTABalanceKey: string = "11111111111111111111111111111111";

/**
 * @param outputType The output type.
 * @param output The output.
 * @returns The balance.
 */
export function getIOTABalance(outputType: OutputType, output: Output): number {
    switch (outputType) {
        case OutputTypeName.AliasOutputType.toString(): {
            const x = output as IAliasOutput;
            return x.balances[IOTABalanceKey] || 0;
        }
        case OutputTypeName.SigLockedColoredOutputType.toString(): {
            const x = output as ISigLockedColoredOutput;
            return x.balances[IOTABalanceKey] || 0;
        }
        case OutputTypeName.ExtendedLockedOutputType.toString(): {
            const x = output as IExtendedLockedOutput;
            return x.balances[IOTABalanceKey] || 0;
        }
        case OutputTypeName.SigLockedSingleOutputType.toString(): {
            const x = output as ISigLockedSingleOutput;
            return x.balance || 0;
        }
        default:
            return 0;
    }
}