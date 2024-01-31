/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Client } from "@iota/sdk-nova";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { IAccountResponse } from "../../models/api/nova/IAccountResponse";
import { IBlockDetailsResponse } from "../../models/api/nova/IBlockDetailsResponse";
import { IBlockResponse } from "../../models/api/nova/IBlockResponse";
import { IOutputDetailsResponse } from "../../models/api/nova/IOutputDetailsResponse";
import { IRewardsResponse } from "../../models/api/nova/IRewardsResponse";
import { INetwork } from "../../models/db/INetwork";
import { HexHelper } from "../../utils/hexHelper";

/**
 * Class to interact with the nova API.
 */
export class NovaApiService {
    /**
     * The client to use for requests.
     */
    private readonly client: Client;

    constructor(network: INetwork) {
        this.client = ServiceFactory.get<Client>(`client-${network.network}`);
    }

    /**
     * Get a block.
     * @param blockId The block id to get the details.
     * @returns The block response.
     */
    public async block(blockId: string): Promise<IBlockResponse> {
        blockId = HexHelper.addPrefix(blockId);
        try {
            const block = await this.client.getBlock(blockId);

            if (!block) {
                return { error: `Couldn't find block with id ${blockId}` };
            }

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
     * @param blockId The block id to get the details.
     * @returns The item details.
     */
    public async blockDetails(blockId: string): Promise<IBlockDetailsResponse> {
        try {
            blockId = HexHelper.addPrefix(blockId);
            const metadata = await this.client.getBlockMetadata(blockId);

            if (metadata) {
                return {
                    metadata,
                };
            }
        } catch (e) {
            logger.error(`Failed fetching block metadata with block id ${blockId}. Cause: ${e}`);
            return { error: "Block metadata fetch failed." };
        }
    }

    /**
     * Get the output details.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public async outputDetails(outputId: string): Promise<IOutputDetailsResponse> {
        try {
            const outputResponse = await this.client.getOutput(outputId);
            return { output: outputResponse };
        } catch (e) {
            logger.error(`Failed fetching output with output id ${outputId}. Cause: ${e}`);
            return { error: "Output not found" };
        }
    }

    /**
     * Get the account details.
     * @param accountId The accountId to get the details for.
     * @returns The account details.
     */
    public async accountDetails(accountId: string): Promise<IAccountResponse | undefined> {
        try {
            const accountOutputId = await this.client.accountOutputId(accountId);

            if (accountOutputId) {
                const outputResponse = await this.outputDetails(accountOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { accountDetails: outputResponse.output };
            }
        } catch {
            return { message: "Account output not found" };
        }
    }

    /**
     * Get the output mana rewards.
     * @param outputId The outputId to get the rewards for.
     * @returns The account details.
     */
    public async getRewards(outputId: string): Promise<IRewardsResponse> {
        const manaRewardsResponse = await this.client.getRewards(outputId);

        return manaRewardsResponse ? { outputId, manaRewards: manaRewardsResponse } : { outputId, message: "Rewards data not found" };
    }
}
