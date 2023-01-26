import { IGlobalMetrics } from "../../../../../protonet.js/packages";
import { IAddressRequest } from "../../models/api/proto/IAddressRequest";
import { IAddressResponse } from "../../models/api/proto/IAddressResponse";
import { IBlockMetadataRequest } from "../../models/api/proto/IBlockMetadataRequest";
import { IBlockMetadataResponse } from "../../models/api/proto/IBlockMetadataResponse";
import { IBlockRequest } from "../../models/api/proto/IBlockRequest";
import { IBlockResponse } from "../../models/api/proto/IBlockResponse";
import { ICommonRequest } from "../../models/api/proto/ICommonRequest";
import { IConflictChildrenResponse } from "../../models/api/proto/IConflictChildrenResponse";
import { IConflictConflictsResponse } from "../../models/api/proto/IConflictConflictsResponse";
import { IConflictRequest } from "../../models/api/proto/IConflictRequest";
import { IConflictVotersResponse } from "../../models/api/proto/IConflictVotersResponse";
import { IConflictWeightResponse } from "../../models/api/proto/IConflictWeightResponse";
import { IEpochBlocksReponse } from "../../models/api/proto/IEpochBlocks";
import { IEpochRequest } from "../../models/api/proto/IEpochRequest";
import { IEpochResponse } from "../../models/api/proto/IEpochResponse";
import { IEpochTransactionsResponse } from "../../models/api/proto/IEpochTransactions";
import { IEpochVotersWeightResponse } from "../../models/api/proto/IEpochVotersWeight";
import { IGlobalMetricsResponse } from "../../models/api/proto/IGlobalMetricsResponse";
import { IOutputMetadataRequest } from "../../models/api/proto/IOutputMetadataRequest";
import { IOutputMetadataResponse } from "../../models/api/proto/IOutputMetadataResponse";
import { IOutputRequest } from "../../models/api/proto/IOutputRequest";
import { IOutputResponse } from "../../models/api/proto/IOutputResponse";
import { ITransactionMetadataRequest } from "../../models/api/proto/ITransactionMetadataRequest";
import { ITransactionMetadataResponse } from "../../models/api/proto/ITransactionMetadataResponse";
import { ITransactionRequest } from "../../models/api/proto/ITransactionRequest";
import { ITransactionResponse } from "../../models/api/proto/ITransactionResponse";
import { INodeInfoRequest } from "../../models/api/stardust/INodeInfoRequest";
import { INodeInfoResponse } from "../../models/api/stardust/INodeInfoResponse";
import { ApiClient } from "../apiClient";

/**
 * Class to handle api communications with the prototype.
 */
export class ProtoApiClient extends ApiClient {
    /**
     * Perform a request to get the base token info for a network.
     * @param request The Base token request.
     * @returns The response from the request.
     */
    public async nodeInfo(request: INodeInfoRequest): Promise<INodeInfoResponse> {
        return this.callApi<unknown, INodeInfoResponse>(
            `node-info/${request.network}`,
            "get"
        );
    }

    /**
     * Perform a request to get the global metrics for a network.
     * @param request The network request.
     * @returns The response from the request.
     */
    public async globalMetrics(request: ICommonRequest): Promise<IGlobalMetricsResponse> {
        return this.callApi<unknown, IGlobalMetricsResponse>(
            `proto/metrics/global/${request.network}`,
            "get"
        );
    }

    public async block(request: IBlockRequest): Promise<IBlockResponse> {
        return this.callApi<unknown, IBlockResponse>(
            `proto/block/${request.network}/${request.id}`,
            "get"
        );
    }

    public async address(request: IAddressRequest): Promise<IAddressResponse> {
        return this.callApi<unknown, IAddressResponse>(
            `proto/address/${request.network}/${request.addressBase58}`,
            "get"
        );
    }

    public async blockMeta(request: IBlockMetadataRequest): Promise<IBlockMetadataResponse> {
        return this.callApi<unknown, IBlockMetadataResponse>(
            `proto/block/metadata/${request.network}/${request.id}`,
            "get"
        );
    }

    public async transaction(request: ITransactionRequest): Promise<ITransactionResponse> {
        return this.callApi<unknown, ITransactionResponse>(
            `proto/transaction/${request.network}/${request.txId}`,
            "get"
        );
    }

    public async transactionMeta(request: ITransactionMetadataRequest): Promise<ITransactionMetadataResponse> {
        return this.callApi<unknown, ITransactionMetadataResponse>(
            `proto/transaction/metadata/${request.network}/${request.txId}`,
            "get"
        );
    }

    public async conflict(request: IConflictRequest): Promise<IConflictWeightResponse> {
        return this.callApi<unknown, IConflictWeightResponse>(
            `proto/conflict/${request.network}/${request.conflictId}`,
            "get"
        );
    }

    public async conflictConflicts(request: IConflictRequest): Promise<IConflictConflictsResponse> {
        return this.callApi<unknown, IConflictConflictsResponse>(
            `proto/conflict/${request.network}/${request.conflictId}/conflicts`,
            "get"
        );
    }

    public async conflictChildren(request: IConflictRequest): Promise<IConflictChildrenResponse> {
        return this.callApi<unknown, IConflictChildrenResponse>(
            `proto/conflict/${request.network}/${request.conflictId}/children`,
            "get"
        );
    }

    public async conflictVoters(request: IConflictRequest): Promise<IConflictVotersResponse> {
        return this.callApi<unknown, IConflictVotersResponse>(
            `proto/conflict/${request.network}/${request.conflictId}/voters`,
            "get"
        );
    }


    public async output(request: IOutputRequest): Promise<IOutputResponse> {
        return this.callApi<unknown, IOutputResponse>(
            `proto/output/${request.network}/${request.outputId}`,
            "get"
        );
    }

    public async outputMetadata(request: IOutputMetadataRequest): Promise<IOutputMetadataResponse> {
        return this.callApi<unknown, IOutputMetadataResponse>(
            `proto/output/metadata/${request.network}/${request.outputId}`,
            "get"
        );
    }

    public async epochById(request: IEpochRequest): Promise<IEpochResponse> {
        if (request.index) {
            return this.callApi<unknown, IEpochResponse>(
                `proto/epoch/${request.network}/index/${request.index}`,
                "get"
            );
        }
        return this.callApi<unknown, IEpochResponse>(
            `proto/epoch/${request.network}/${request.epochId}`,
            "get"
        );
    }

    public async epochTxs(request: IEpochRequest): Promise<IEpochTransactionsResponse> {
        return this.callApi<unknown, IEpochTransactionsResponse>(
            `proto/epoch/${request.network}/transactions/${request.index}`,
            "get"
        );
    }

    public async epochBlocks(request: IEpochRequest): Promise<IEpochBlocksReponse> {
        return this.callApi<unknown, IEpochBlocksReponse>(
            `proto/epoch/${request.network}/blocks/${request.index}`,
            "get"
        );
    }

    public async epochVoters(request: IEpochRequest): Promise<IEpochVotersWeightResponse> {
        return this.callApi<unknown, IEpochVotersWeightResponse>(
            `proto/epoch/${request.network}/voters/${request.index}`,
            "get"
        );
    }
}

