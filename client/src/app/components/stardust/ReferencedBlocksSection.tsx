import { IBlock, MILESTONE_PAYLOAD_TYPE, TAGGED_DATA_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE } from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import NetworkContext from "../../context/NetworkContext";
import Spinner from "../Spinner";
import "./ReferencedBlocksSection.scss";

interface ReferenceBlocksSectionProps {
    blockIds?: string[];
}

const ReferenceBlocksSection: React.FC<ReferenceBlocksSectionProps> = ({ blockIds }) => {
    const isMounted = useRef(false);
    const { name: network, bech32Hrp } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [jobToStatus, setJobToStatus] = useState(
        new Map<string, PromiseStatus>([["loadBlockData", PromiseStatus.PENDING]])
    );
    const [idToBlockData, setIdToBlockData] = useState<Map<string, { block: IBlock; value?: number }>>(new Map());

    useEffect(() => {
        isMounted.current = true;
        const loadBlock = async (blockId: string) => {
            const blockDataLoadMonitor = new PromiseMonitor(status => {
                if (isMounted.current) {
                    setJobToStatus(jobToStatus.set("loadBlockData", status));
                }
            });

            // eslint-disable-next-line no-void
            void blockDataLoadMonitor.enqueue(
                async () => tangleCacheService.block(network, blockId).then(async blockData => {
                    if (!blockData.error && blockData.block) {
                        if (blockData.block?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                            const { transferTotal } = await TransactionsHelper.getInputsAndOutputs(
                                blockData.block,
                                network,
                                bech32Hrp,
                                tangleCacheService
                            );

                            if (isMounted.current) {
                                const updated = new Map(
                                    idToBlockData.set(blockId, { block: blockData.block, value: transferTotal })
                                        .entries()
                                );
                                setIdToBlockData(updated);
                            }
                        } else if (isMounted.current) {
                            const updated = new Map(
                                idToBlockData.set(blockId, { block: blockData.block })
                                    .entries()
                            );
                            setIdToBlockData(updated);
                        }
                    }
                })
            );
        };

        if (blockIds && blockIds?.length > 0) {
            for (const blockId of blockIds) {
                // eslint-disable-next-line no-void
                void loadBlock(blockId);
            }
        }

        return () => {
            isMounted.current = false;
        };
    }, [blockIds]);

    const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE) ||
        idToBlockData.size !== blockIds?.length;

    return (
        <div className="section refblocks">
            {blockIds && !isLoading ? (
                <table className="refblocks__table">
                    <thead>
                        <tr>
                            <th>BLOCK ID</th>
                            <th>PAYLOAD</th>
                            <th>VALUE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            blockIds.map((blockId, idx) => {
                                const { block, value } = idToBlockData.get(blockId) ?? {};
                                const payloadType = computePayloadType(block);

                                return (
                                    <tr key={`block-${idx}`}>
                                        <td>{blockId}</td>
                                        <td>{payloadType}</td>
                                        <td>{value !== undefined ? value : "-"}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            ) : <Spinner />}
        </div>
    );
};

ReferenceBlocksSection.defaultProps = {
    blockIds: undefined
};

/**
 * Compute a payload type string from block.
 * @param block The block data.
 * @returns The payload type string.
 */
function computePayloadType(block: IBlock | undefined): string {
    let payloadType = "-";

    if (!block) {
        return payloadType;
    }

    switch (block.payload?.type) {
        case TAGGED_DATA_PAYLOAD_TYPE:
            payloadType = "Data";
            break;
        case TRANSACTION_PAYLOAD_TYPE:
            payloadType = "Transaction";
            break;
        case MILESTONE_PAYLOAD_TYPE:
            payloadType = "Milestone";
            break;
        default:
            payloadType = "No payload";
            break;
    }

    return payloadType;
}

export default ReferenceBlocksSection;

