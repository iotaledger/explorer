import { __ClientMethods__, OutputResponse, Client, Block, IBlockMetadata } from "@iota/sdk-nova";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { IBlockDetailsResponse } from "../../models/api/nova/IBlockDetailsResponse";
import { IBlockResponse } from "../../models/api/nova/IBlockResponse";
import { IOutputDetailsResponse } from "../../models/api/nova/IOutputDetailsResponse";
import { INetwork } from "../../models/db/INetwork";
import { HexHelper } from "../../utils/hexHelper";

type NameType<T> = T extends { name: infer U } ? U : never;
type ExtractedMethodNames = NameType<__ClientMethods__>;

/**
 * Class to interact with the nova API.
 */
export class NovaApi {
    /**
     * Get a block.
     * @param network The network to find the items on.
     * @param blockId The block id to get the details.
     * @returns The block response.
     */
    public static async block(network: INetwork, blockId: string): Promise<IBlockResponse> {
        blockId = HexHelper.addPrefix(blockId);
        const block = await this.tryFetchNodeThenPermanode<string, Block>(blockId, "getBlock", network);

        if (!block) {
            return { error: `Couldn't find block with id ${blockId}` };
        }

        try {
            if (block && Object.keys(block).length > 0) {
                return {
                    block,
                };
            }
        } catch (e) {
            logger.error(`Failed fetching block with block id ${blockId}. Cause: ${e}`);
            return { error: "Block fetch failed." };
        }
    }

    /**
     * Get the block details.
     * @param network The network to find the items on.
     * @param blockId The block id to get the details.
     * @returns The item details.
     */
    public static async blockDetails(network: INetwork, blockId: string): Promise<IBlockDetailsResponse> {
        blockId = HexHelper.addPrefix(blockId);
        const metadata = await this.tryFetchNodeThenPermanode<string, IBlockMetadata>(blockId, "getBlockMetadata", network);

        if (metadata) {
            return {
                metadata,
            };
        }
    }

    /**
     * Get the output details.
     * @param network The network to find the items on.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public static async outputDetails(network: INetwork, outputId: string): Promise<IOutputDetailsResponse> {
        const outputResponse = await this.tryFetchNodeThenPermanode<string, OutputResponse>(outputId, "getOutput", network);

        return outputResponse ? { output: outputResponse } : { message: "Output not found" };
    }

    /**
     * Generic helper function to try fetching from node client.
     * On failure (or not present), we try to fetch from permanode (if configured).
     * @param args The argument(s) to pass to the fetch calls.
     * @param methodName The function to call on the client.
     * @param network The network config in context.
     * @returns The results or null if call(s) failed.
     */
    public static async tryFetchNodeThenPermanode<A, R>(args: A, methodName: ExtractedMethodNames, network: INetwork): Promise<R> | null {
        const { permaNodeEndpoint, disableApiFallback } = network;
        const isFallbackEnabled = !disableApiFallback;
        const client = ServiceFactory.get<Client>(`client-${network.network}`);

        try {
            // try fetch from node
            const result: Promise<R> = client[methodName](args);
            return await result;
        } catch {}

        if (permaNodeEndpoint && isFallbackEnabled) {
            const permanodeClient = ServiceFactory.get<Client>(`permanode-client-${network.network}`);
            try {
                // try fetch from permanode (chronicle)
                const result: Promise<R> = permanodeClient[methodName](args);
                return await result;
            } catch {}
        }

        return null;
    }
}
