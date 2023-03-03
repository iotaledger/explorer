import { IBlock, TRANSACTION_PAYLOAD_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { useContext, useEffect, useState } from "react";
import { ServiceFactory } from "../../../../../../factories/serviceFactory";
import { useIsMounted } from "../../../../../../helpers/hooks/useIsMounted";
import { NameHelper } from "../../../../../../helpers/stardust/nameHelper";
import { TransactionsHelper } from "../../../../../../helpers/stardust/transactionsHelper";
import { formatAmount } from "../../../../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../../../../services/stardust/stardustTangleCacheService";
import NetworkContext from "../../../../../context/NetworkContext";
import Spinner from "../../../../Spinner";
import TruncatedId from "../../../TruncatedId";

interface Props {
    blockId: string;
    isTable?: boolean;
}

interface BlockData {
    block?: IBlock;
    value?: number;
}

const ReferencedBlocksSectionRow: React.FC<Props> = ({ blockId, isTable }) => {
    const isMounted = useIsMounted();
    const { name: network, bech32Hrp, tokenInfo } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [blockData, setBlockData] = useState<BlockData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFormattedValue, setIsFormattedValue] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        // eslint-disable-next-line no-void
        void tangleCacheService.block(network, blockId).then(async response => {
            if (!response.error && response.block) {
                if (response.block?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                    const { transferTotal } = await TransactionsHelper.getInputsAndOutputs(
                        response.block,
                        network,
                        bech32Hrp,
                        tangleCacheService
                    );

                    if (isMounted) {
                        setBlockData({
                            block: response.block,
                            value: transferTotal
                        });
                    }
                } else if (isMounted) {
                    setBlockData({
                        block: response.block
                    });
                }
            }

            setIsLoading(false);
        });
    }, [blockId]);

    const payloadType = NameHelper.getPayloadType(blockData?.block);
    const transactionValue = blockData?.value && blockData.value !== undefined ?
        formatAmount(Number(blockData.value), tokenInfo, !isFormattedValue) :
        "--";

    return (
        isTable ? (
            <tr>
                <td className="refblocks__block-id">
                    <TruncatedId
                        id={blockId}
                        link={`/${network}/block/${blockId}`}
                    />
                </td>
                <td>{isLoading ? <Spinner compact /> : payloadType}</td>
                <td className="refblocks__tx-value">{
                    isLoading ?
                        <Spinner compact /> :
                        <div
                            onClick={() => setIsFormattedValue(!isFormattedValue)}
                            className={classNames({ "pointer": transactionValue !== "--" })}
                        >
                            {transactionValue}
                        </div>
                }
                </td>
            </tr>
        ) : (
            <div className="card">
                <div className="field">
                    <div className="label">
                        Block Id:
                    </div>
                    <div className="card--value value__block-id">
                        <TruncatedId
                            id={blockId}
                            link={`/${network}/block/${blockId}`}
                        />
                    </div>
                </div>
                {isLoading ? <Spinner compact /> : (
                    <React.Fragment>
                        <div className="field">
                            <div className="label">
                                Payload type:
                            </div>
                            <div className="card--value card--value--payload">
                                {payloadType}
                            </div>
                        </div>
                        {transactionValue !== "--" && (
                            <div className="field">
                                <div className="label">
                                    Value:
                                </div>
                                <div className="card--value card--value--tx-value">
                                    <span
                                        onClick={() => setIsFormattedValue(!isFormattedValue)}
                                        className="pointer margin-r-5"
                                    >
                                        {transactionValue}
                                    </span>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                )}
            </div>
        )
    );
};

ReferencedBlocksSectionRow.defaultProps = {
    isTable: undefined
};

export default ReferencedBlocksSectionRow;

