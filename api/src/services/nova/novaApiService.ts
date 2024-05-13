import {
    Client,
    HexEncodedString,
    OutputWithMetadataResponse,
    OutputsResponse,
    BasicOutputQueryParameters,
    NftOutputQueryParameters,
} from "@iota/sdk-nova";
import moment from "moment";
import { NovaTimeService } from "./novaTimeService";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { IFoundriesResponse } from "../../models/api/nova/foundry/IFoundriesResponse";
import { IFoundryResponse } from "../../models/api/nova/foundry/IFoundryResponse";
import { IAccountDetailsResponse } from "../../models/api/nova/IAccountDetailsResponse";
import { IAccountValidatorDetailsResponse } from "../../models/api/nova/IAccountValidatorDetailsResponse";
import { IAddressDetailsResponse } from "../../models/api/nova/IAddressDetailsResponse";
import { IAnchorDetailsResponse } from "../../models/api/nova/IAnchorDetailsResponse";
import { IBlockDetailsResponse } from "../../models/api/nova/IBlockDetailsResponse";
import { IBlockResponse } from "../../models/api/nova/IBlockResponse";
import { ICongestionResponse } from "../../models/api/nova/ICongestionResponse";
import { IDelegationByValidatorResponse } from "../../models/api/nova/IDelegationByValidatorResponse";
import { IDelegationDetailsResponse } from "../../models/api/nova/IDelegationDetailsResponse";
import { IDelegationWithDetails } from "../../models/api/nova/IDelegationWithDetails";
import { IEpochCommitteeResponse } from "../../models/api/nova/IEpochCommitteeResponse";
import { INftDetailsResponse } from "../../models/api/nova/INftDetailsResponse";
import { IOutputDetailsResponse } from "../../models/api/nova/IOutputDetailsResponse";
import { IRewardsResponse } from "../../models/api/nova/IRewardsResponse";
import { ISearchResponse } from "../../models/api/nova/ISearchResponse";
import { ISlotResponse } from "../../models/api/nova/ISlotResponse";
import { ITaggedOutputsResponse } from "../../models/api/nova/ITaggedOutputsResponse";
import { ITransactionDetailsResponse } from "../../models/api/nova/ITransactionDetailsResponse";
import { ITransactionMetadataResponse } from "../../models/api/nova/ITransactionMetadataResponse";
import { IOutputsResponse } from "../../models/api/nova/outputs/IOutputsResponse";
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

    /**
     * Nova time service for conversions.
     */
    private readonly _novatimeService: NovaTimeService;

    constructor(network: INetwork) {
        this.network = network;
        this.client = ServiceFactory.get<Client>(`client-${network.network}`);
        this._novatimeService = ServiceFactory.get<NovaTimeService>(`nova-time-${network.network}`);
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
     * Get the transaction metadata.
     * @param transactionId The transaction id to get the metadata of.
     * @returns The item details.
     */
    public async transactionMetadata(transactionId: string): Promise<ITransactionMetadataResponse> {
        try {
            transactionId = HexHelper.addPrefix(transactionId);
            const metadata = await this.client.getTransactionMetadata(transactionId);

            if (metadata) {
                return {
                    metadata,
                };
            }
        } catch (e) {
            logger.error(`Failed fetching transaction metadata with transaction id ${transactionId}. Cause: ${e}`);
            return { error: "Block metadata fetch failed." };
        }
    }

    /**
     * Get the transaction included block.
     * @param transactionId The transaction id to get the details.
     * @returns The item details.
     */
    public async transactionIncludedBlock(transactionId: string): Promise<ITransactionDetailsResponse> {
        transactionId = HexHelper.addPrefix(transactionId);
        try {
            const block = await this.client.getIncludedBlock(transactionId);

            if (!block) {
                return { error: `Couldn't find block from transaction id ${transactionId}` };
            }
            if (block && Object.keys(block).length > 0) {
                return {
                    block,
                };
            }
        } catch (e) {
            logger.error(`Failed fetching block with transaction id ${transactionId}. Cause: ${e}`);
            return { error: "Block fetch failed." };
        }
    }

    /**
     * Get the output details.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public async outputDetails(outputId: string): Promise<IOutputDetailsResponse> {
        try {
            const outputResponse = await this.client.getOutputWithMetadata(outputId);
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
     * Get the delegation output details.
     * @param delegationId The delegationId to get the output details for.
     * @returns The delegation output details.
     */
    public async delegationDetails(delegationId: string): Promise<IOutputDetailsResponse | undefined> {
        try {
            const delegationOutputId = await this.client.delegationOutputId(delegationId);

            if (delegationOutputId) {
                const outputResponse = await this.outputDetails(delegationOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { output: outputResponse.output };
            }
        } catch {
            return { message: "Delegation output not found" };
        }
    }

    /**
     * Get controlled Foundry output id by controller Account address
     * @param accountAddress The bech32 account address to get the controlled Foundries for.
     * @returns The foundry outputs.
     */
    public async accountFoundries(accountAddress: string): Promise<IFoundriesResponse | undefined> {
        try {
            const response = await this.client.foundryOutputIds({ account: accountAddress });

            if (response) {
                return {
                    foundryOutputsResponse: response,
                };
            }
        } catch {
            return { message: "Foundries output not found" };
        }
    }

    /**
     * Get the foundry details.
     * @param foundryId The foundryId to get the details for.
     * @returns The foundry details.
     */
    public async foundryDetails(foundryId: string): Promise<IFoundryResponse | undefined> {
        try {
            const foundryOutputId = await this.client.foundryOutputId(foundryId);

            if (foundryOutputId) {
                const outputResponse = await this.outputDetails(foundryOutputId);

                return outputResponse.error ? { error: outputResponse.error } : { foundryDetails: outputResponse.output };
            }
        } catch {
            return { message: "Foundry output not found" };
        }
    }

    /**
     * Get the outputs details.
     * @param outputIds The output ids to get the details.
     * @returns The item details.
     */
    public async outputsDetails(outputIds: string[]): Promise<OutputWithMetadataResponse[]> {
        const promises: Promise<IOutputDetailsResponse>[] = [];
        const outputResponses: OutputWithMetadataResponse[] = [];

        for (const outputId of outputIds) {
            const promise = this.outputDetails(outputId);
            promises.push(promise);
        }
        try {
            await Promise.all(promises).then((results) => {
                for (const outputDetails of results) {
                    if (outputDetails.output?.output && outputDetails.output?.metadata) {
                        outputResponses.push(outputDetails.output);
                    }
                }
            });

            return outputResponses;
        } catch (e) {
            logger.error(`Fetching outputs details failed. Cause: ${e}`);
        }
    }

    /**
     * Get the outputs mana rewards.
     * @param outputIds The output ids to get the mana rewards for.
     * @returns The rewards details.
     */
    public async outputsRewardsDetails(outputIds: string[]): Promise<IRewardsResponse[]> {
        const promises: Promise<IRewardsResponse>[] = [];

        for (const outputId of outputIds) {
            const promise = this.getRewards(outputId);
            promises.push(promise);
        }
        try {
            return await Promise.all(promises);
        } catch (e) {
            logger.error(`Fetching outputs rewards failed. Cause: ${e}`);
        }
    }

    /**
     * Get the relevant anchor output details for an address.
     * @param addressBech32 The address in bech32 format.
     * @returns The anchor output details.
     */
    public async anchorOutputDetailsByAddress(addressBech32: string): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];

        do {
            try {
                const outputIdsResponse = await this.client.anchorOutputIds({ stateController: addressBech32, cursor: cursor ?? "" });

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching anchor output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        const outputResponses = await this.outputsDetails(outputIds);

        return {
            outputs: outputResponses,
        };
    }

    /**
     * Get the relevant basic output details for an address.
     * @param addressBech32 The address in bech32 format.
     * @returns The basic output details.
     */
    public async basicOutputDetailsByAddress(addressBech32: string): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const expiredIds = await this.basicExpiredOutputIdsByAddress(addressBech32);
        const notClaimedIds = await this.basicNotClaimedOutputIdsByAddress(addressBech32);

        do {
            try {
                const outputIdsResponse = await this.client.basicOutputIds({ address: addressBech32, cursor: cursor ?? "" });

                outputIds = outputIds.concat(outputIdsResponse.items.filter((id) => !expiredIds.includes(id)));
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching basic output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        outputIds = outputIds.concat(notClaimedIds);
        const outputResponses = await this.outputsDetails(outputIds);

        return {
            outputs: outputResponses,
        };
    }

    /**
     * Get the relevant nft output details for an address.
     * @param addressBech32 The address in bech32 format.
     * @returns The alias output details.
     */
    public async nftOutputDetailsByAddress(addressBech32: string): Promise<IAddressDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const expiredIds = await this.nftExpiredOutputIdsByAddress(addressBech32);
        const notClaimedIds = await this.nftNotClaimedOutputIdsByAddress(addressBech32);

        do {
            try {
                const outputIdsResponse = await this.client.nftOutputIds({ address: addressBech32, cursor: cursor ?? "" });

                outputIds = outputIds.concat(outputIdsResponse.items.filter((id) => !expiredIds.includes(id)));
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching nft output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        outputIds = outputIds.concat(notClaimedIds);
        const outputResponses = await this.outputsDetails(outputIds);
        return {
            outputs: outputResponses,
        };
    }

    /**
     * Get the relevant delegation output details for an address.
     * Return the output this address is delegating.
     * @param addressBech32 The address in bech32 format.
     * @returns The delegation output details.
     */
    public async delegationOutputDetailsByAddress(addressBech32: string): Promise<IDelegationDetailsResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const delegationResponse: IDelegationWithDetails[] = [];

        do {
            try {
                const outputIdsResponse = await this.client.delegationOutputIds({ address: addressBech32, cursor: cursor ?? "" });

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching delegation output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        const outputRewards = await this.outputsRewardsDetails(outputIds);
        const outputResponses = await this.outputsDetails(outputIds);

        for (const outputResponse of outputResponses) {
            const matchingReward = outputRewards?.find((outputReward) => outputReward.outputId === outputResponse.metadata.outputId);
            delegationResponse.push({ rewards: matchingReward, output: outputResponse });
        }

        return {
            outputs: delegationResponse,
        };
    }

    /**
     * Get the delegation outputs that this address has been delegated to.
     * Return the outputs for which this address is the 'validator'.
     * @param addressBech32 The address in bech32 format.
     * @returns The delegation output details.
     */
    public async delegationOutputDetailsByValidator(addressBech32: string): Promise<IDelegationByValidatorResponse> {
        let cursor: string | undefined;
        let outputIds: string[] = [];

        do {
            try {
                const outputIdsResponse = await this.client.delegationOutputIds({ validator: addressBech32, cursor: cursor ?? "" });

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching delegation output ids (by-validator) failed. Cause: ${e}`);
            }
        } while (cursor);

        const outputResponses = await this.outputsDetails(outputIds);

        return {
            outputs: outputResponses,
        };
    }

    /**
     * Get Congestion for Account
     * @param accountId The account address to get the congestion for.
     * @returns The Congestion.
     */
    public async getAccountCongestion(accountId: string): Promise<ICongestionResponse | undefined> {
        try {
            const response = await this.client.getAccountCongestion(accountId);

            if (response) {
                return {
                    congestion: response,
                };
            }
        } catch {
            return { message: "Account congestion not found" };
        }
    }

    /**
     * Get validator details for Account
     * @param accountId The account id to get the validator details for.
     * @returns The Congestion.
     */
    public async getAccountValidatorDetails(accountId: string): Promise<IAccountValidatorDetailsResponse | undefined> {
        try {
            const response = await this.client.getValidator(accountId);

            if (response) {
                return {
                    validatorDetails: response,
                };
            }
        } catch {
            return { message: "Validator details not found" };
        }
    }

    /**
     * Get the basic output Ids with specific tag feature.
     * @param encodedTag The tag hex.
     * @param pageSize The page size.
     * @param cursor The cursor for pagination.
     * @returns The basic outputs response.
     */
    public async taggedBasicOutputs(
        encodedTag: HexEncodedString,
        pageSize: number,
        cursor?: string,
    ): Promise<IOutputsResponse | undefined> {
        try {
            const params: BasicOutputQueryParameters = { tag: encodedTag, pageSize, cursor: cursor ?? "" };
            const basicOutputIdsResponse: OutputsResponse = await this.client.basicOutputIds(params);

            if (basicOutputIdsResponse?.items.length > 0) {
                return { outputs: basicOutputIdsResponse };
            }
        } catch {}

        return { error: `Basic outputs not found with given tag ${encodedTag}` };
    }

    /**
     * Get the nft output Ids with specific tag feature.
     * @param encodedTag The tag hex.
     * @param pageSize The page size.
     * @param cursor The cursor for pagination.
     * @returns The nft outputs response.
     */
    public async taggedNftOutputs(encodedTag: HexEncodedString, pageSize: number, cursor?: string): Promise<IOutputsResponse | undefined> {
        try {
            const params: NftOutputQueryParameters = { tag: encodedTag, pageSize, cursor: cursor ?? "" };
            const nftOutputIdsResponse: OutputsResponse = await this.client.nftOutputIds(params);

            if (nftOutputIdsResponse?.items.length > 0) {
                return { outputs: nftOutputIdsResponse };
            }
        } catch {}

        return { error: `Nft outputs not found with given tag ${encodedTag}` };
    }

    /**
     * Get the output Ids (basic/nft) with specific tag feature.
     * @param tag The tag hex.
     * @returns .
     */
    public async taggedOutputs(tag: HexEncodedString): Promise<ITaggedOutputsResponse | undefined> {
        const basicOutputs = await this.taggedBasicOutputs(tag, 10);
        const nftOutputs = await this.taggedNftOutputs(tag, 10);

        return {
            basicOutputs,
            nftOutputs,
        };
    }

    /**
     * Get the output mana rewards.
     * @param outputId The outputId to get the rewards for.
     * @param slotIndex The slotIndex to get the rewards for.
     * @returns The mana rewards.
     */
    public async getRewards(outputId: string, slotIndex?: string): Promise<IRewardsResponse> {
        const parsedSlotIndex = slotIndex === undefined ? undefined : Number.parseInt(slotIndex, 10);
        const manaRewardsResponse = await this.client.getOutputManaRewards(outputId, parsedSlotIndex);

        return manaRewardsResponse ? { outputId, manaRewards: manaRewardsResponse } : { outputId, message: "Rewards data not found" };
    }

    /**
     * Get the slot commitment.
     * @param slotIndex The slot index to get the commitment for.
     * @returns The slot commitment.
     */
    public async getSlotCommitment(slotIndex: number): Promise<ISlotResponse> {
        try {
            const slot = await this.client.getCommitmentBySlot(slotIndex);

            return { slot };
        } catch (e) {
            logger.error(`Failed fetching slot with slot index ${slotIndex}. Cause: ${e}`);
        }
    }

    /**
     * Get the slot commitment by commitment id.
     * @param slotCommitmentId The slot commitment id to get the commitment for.
     * @returns The slot commitment.
     */
    public async getCommitment(slotCommitmentId: string): Promise<ISlotResponse> {
        try {
            const slot = await this.client.getCommitment(slotCommitmentId);

            return { slot };
        } catch (e) {
            logger.error(`Failed fetching slot with commitment id ${slotCommitmentId}. Cause: ${e}`);
        }
    }

    /**
     * Get the epoch committee.
     * @param epochIndex The epoch index to get the committee for.
     * @returns The epoch committee.
     */
    public async getEpochCommittee(epochIndex: number): Promise<IEpochCommitteeResponse> {
        try {
            const response = await this.client.getCommittee(epochIndex);

            if (response) {
                return {
                    committeeResponse: response,
                };
            }
        } catch (e) {
            logger.error(`Failed fetching committee for epoch index ${epochIndex}. Cause: ${e}`);
        }
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

    /**
     * Get the expired basic output ids for an address (outputs no longer owned by the address but by the expirationReturnAddress).
     * @param addressBech32 The address in bech32 format.
     * @returns The basic output ids.
     */
    private async basicExpiredOutputIdsByAddress(addressBech32: string): Promise<string[]> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const currentSlotIndex = this._novatimeService.getUnixTimestampToSlotIndex(moment().unix());

        do {
            try {
                const outputIdsResponse = await this.client.basicOutputIds({
                    address: addressBech32,
                    expiresBefore: currentSlotIndex,
                    cursor: cursor ?? "",
                });

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching expired basic output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        return outputIds;
    }

    /**
     * Get the expired ntf output ids for an address (outputs no longer owned by the address but by the expirationReturnAddress).
     * @param addressBech32 The address in bech32 format.
     * @returns The nft output ids.
     */
    private async nftExpiredOutputIdsByAddress(addressBech32: string): Promise<string[]> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const currentSlotIndex = this._novatimeService.getUnixTimestampToSlotIndex(moment().unix());

        do {
            try {
                const outputIdsResponse = await this.client.nftOutputIds({
                    address: addressBech32,
                    expiresBefore: currentSlotIndex,
                    cursor: cursor ?? "",
                });

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching expired nft output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        return outputIds;
    }

    /**
     * Get the not claimed basic output ids for an address (outputs owned by the expirationReturnAddress).
     * @param expirationReturnAddress The address in bech32 format.
     * @returns The nft output ids.
     */
    private async basicNotClaimedOutputIdsByAddress(expirationReturnAddress: string): Promise<string[]> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const currentSlotIndex = this._novatimeService.getUnixTimestampToSlotIndex(moment().unix());

        do {
            try {
                const outputIdsResponse = await this.client.basicOutputIds({
                    expirationReturnAddress,
                    expiresBefore: currentSlotIndex,
                    cursor: cursor ?? "",
                });

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching not claimed nft output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        return outputIds;
    }

    /**
     * Get the not claimed ntf output ids for an address (outputs owned by the expirationReturnAddress).
     * @param expirationReturnAddress The address in bech32 format.
     * @returns The nft output ids.
     */
    private async nftNotClaimedOutputIdsByAddress(expirationReturnAddress: string): Promise<string[]> {
        let cursor: string | undefined;
        let outputIds: string[] = [];
        const currentSlotIndex = this._novatimeService.getUnixTimestampToSlotIndex(moment().unix());

        do {
            try {
                const outputIdsResponse = await this.client.nftOutputIds({
                    expirationReturnAddress,
                    expiresBefore: currentSlotIndex,
                    cursor: cursor ?? "",
                });

                outputIds = outputIds.concat(outputIdsResponse.items);
                cursor = outputIdsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching not claimed nft output ids failed. Cause: ${e}`);
            }
        } while (cursor);

        return outputIds;
    }
}
