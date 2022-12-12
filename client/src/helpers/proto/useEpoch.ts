import { IEpoch, IEpochBlocks, IEpochTransactions, IEpochVotersWeight } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

/**
 *
 * @param id
 */
function getEpochIndexFromId(id: string): number {
    const split = id.split(":");
    if (split.length !== 2) {
        return -1;
    }
    return Number.parseInt(split[1], 10);
}

type EpochResult = IEpoch | null | undefined;

/**
 *
 * @param network
 * @param txId
 * @param epochId
 * @param index
 */
export function useEpoch(network: string, epochId: string, index?: number): [EpochResult, boolean] {
    const [epoch, setEpoch] = useState<IEpoch | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const fetchedEpoch = await apiClient.epochById({ network, epochId, index });
            if (fetchedEpoch.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setEpoch(null);
                return;
            }
            setEpoch(fetchedEpoch.epoch);
            setIsLoading(false);
        })();
    }, [epochId]);

    return [epoch, isLoading];
}

type EpochTxsResult = IEpochTransactions | null | undefined;

/**
 *
 * @param network
 * @param epochId
 * @param epochIndex
 */
export function useEpochTxs(network: string, epochId: string, epochIndex?: number): [EpochTxsResult, boolean] {
    const index = epochId ? getEpochIndexFromId(epochId) : epochIndex;
    const [txs, setTxs] = useState<IEpochTransactions | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const fetchedTxs = await apiClient.epochTxs({ network, index });
            if (fetchedTxs.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setTxs(null);
                return;
            }
            setTxs(fetchedTxs.transactions);
            setIsLoading(false);
        })();
    }, [epochId]);

    return [txs, isLoading];
}

type EpochBlocksResult = IEpochBlocks | null | undefined;

/**
 *
 * @param network
 * @param epochId
 * @param epochIndex
 */
export function useEpochBlocks(network: string, epochId: string, epochIndex?: number):
    [EpochBlocksResult, boolean] {
    const index = epochId ? getEpochIndexFromId(epochId) : epochIndex;
    const [blocks, setBlocks] = useState<IEpochBlocks | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const fetchedBlocks = await apiClient.epochBlocks({ network, index });
            if (fetchedBlocks.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setBlocks(null);
                return;
            }
            setBlocks(fetchedBlocks.blocks);
            setIsLoading(false);
        })();
    }, [epochId]);

    return [blocks, isLoading];
}


type EpochVotersWeightResult = IEpochVotersWeight | null | undefined;

/**
 *
 * @param network
 * @param epochId
 * @param epochIndex
 */
export function useEpochVotersWeight(network: string, epochId: string, epochIndex?: number):
    [EpochVotersWeightResult, boolean] {
    const index = epochId ? getEpochIndexFromId(epochId) : epochIndex;
    const [voters, setVoters] = useState<IEpochVotersWeight | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const fetchedVoters = await apiClient.epochVoters({ network, index });
            if (fetchedVoters.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setVoters(null);
                return;
            }
            setVoters(fetchedVoters.voters);
            setIsLoading(false);
        })();
    }, [epochId]);

    return [voters, isLoading];
}
