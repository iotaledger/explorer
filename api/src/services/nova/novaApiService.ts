/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Client } from "@iota/sdk-nova";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { IAccountDetailsResponse } from "../../models/api/nova/IAccountDetailsResponse";
import { IAnchorDetailsResponse } from "../../models/api/nova/IAnchorDetailsResponse";
import { IBlockDetailsResponse } from "../../models/api/nova/IBlockDetailsResponse";
import { IBlockResponse } from "../../models/api/nova/IBlockResponse";
import { INftDetailsResponse } from "../../models/api/nova/INftDetailsResponse";
import { IOutputDetailsResponse } from "../../models/api/nova/IOutputDetailsResponse";
import { IRewardsResponse } from "../../models/api/nova/IRewardsResponse";
import { ISearchResponse } from "../../models/api/nova/ISearchResponse";
import { INetwork } from "../../models/db/INetwork";
import { HexHelper } from "../../utils/hexHelper";
import { SearchExecutor } from "../../utils/nova/searchExecutor";
import { SearchQueryBuilder } from "../../utils/nova/searchQueryBuilder";

/**
 * Class to interact with the nova API.
 */
export class NovaApiService {
    /**
     * The network in context.
     */
    private readonly network: INetwork;

    /**
     * The client to use for requests.
     */
    private readonly client: Client;

    constructor(network: INetwork) {
        this.network = network;
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
     * Get the account output details.
     * @param accountId The accountId to get the output details for.
     * @returns The account output details.
     */
    public async accountDetails(accountId: string): Promise<IAccountDetailsResponse | undefined> {
        try {
            const accountOutputId = await this.client.accountOutputId(accountId);

            if (accountOutputId) {
                const outputResponse = await this.outputDetails(accountOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { accountOutputDetails: outputResponse.output };
            }
        } catch {
            return { message: "Account output not found" };
        }
    }

    /**
     * Get the nft output details.
     * @param nftId The nftId to get the output details for.
     * @returns The nft output details.
     */
    public async nftDetails(nftId: string): Promise<INftDetailsResponse | undefined> {
        try {
            const nftOutputId = await this.client.nftOutputId(nftId);

            if (nftOutputId) {
                const outputResponse = await this.outputDetails(nftOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { nftOutputDetails: outputResponse.output };
            }
        } catch {
            return { message: "Nft output not found" };
        }
    }

    /**
     * Get the anchor output details.
     * @param anchorId The anchorId to get the output details for.
     * @returns The anchor output details.
     */
    public async anchorDetails(anchorId: string): Promise<IAnchorDetailsResponse | undefined> {
        try {
            const anchorOutputId = await this.client.anchorOutputId(anchorId);

            if (anchorOutputId) {
                const outputResponse = await this.outputDetails(anchorOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { anchorOutputDetails: outputResponse.output };
            }
        } catch {
            return { message: "Anchor output not found" };
        }
    }

    /**
     * Get the output mana rewards.
     * @param outputId The outputId to get the rewards for.
     * @returns The mana rewards.
     */
    public async getRewards(outputId: string): Promise<IRewardsResponse> {
        const manaRewardsResponse = await this.client.getRewards(outputId);

        return manaRewardsResponse ? { outputId, manaRewards: manaRewardsResponse } : { outputId, message: "Rewards data not found" };
    }

    /**
     * Find item on the stardust network.
     * @param query The query to use for finding items.
     * @returns The item found.
     */
    public async search(query: string): Promise<ISearchResponse> {
        const searchQuery = new SearchQueryBuilder(query, this.network.bechHrp).build();
        return new SearchExecutor(this.network, searchQuery).run();
    }
}
