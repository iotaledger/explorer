import { IBlock, TRANSACTION_PAYLOAD_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { NameHelper } from "../../../../../helpers/stardust/nameHelper";
import { TransactionsHelper } from "../../../../../helpers/stardust/transactionsHelper";
import { formatAmount } from "../../../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../../../services/stardust/stardustTangleCacheService";
import NetworkContext from "../../../../context/NetworkContext";
import Spinner from "../../../Spinner";

interface Props {
    blockId: string;
    isTable?: boolean;
}

interface BlockData {
    block?: IBlock;
    value?: number;
}

const computePayloadType = (block: IBlock | undefined) => NameHelper.getPayloadType(block);

const ReferencedBlocksSectionRow: React.FC<Props> = ({ blockId, isTable }) => {
    const isMounted = useRef(false);
    const { name: network, bech32Hrp, tokenInfo } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [blockData, setBlockData] = useState<BlockData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFormattedValue, setIsFormattedValue] = useState<boolean>(true);

    const unmount = () => {
        isMounted.current = false;
    };

    useEffect(() => {
        isMounted.current = true;
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

                    if (isMounted.current) {
                        setBlockData({
                            block: response.block,
                            value: transferTotal
                        });
                    }
                } else if (isMounted.current) {
                    setBlockData({
                        block: response.block
                    });
                }
            }

            setIsLoading(false);
        });

        return unmount;
    }, [blockId]);

    const payloadType = computePayloadType(blockData?.block);
    const transactionValue = blockData?.value && blockData.value !== undefined ?
        formatAmount(Number(blockData.value), tokenInfo, !isFormattedValue) :
        "--";

    return (
        isTable ? (
            <tr>
                <td>
                    <Link
                        to={`/${network}/block/${blockId}`}
                        className="refblocks__table__data__block-id"
                    >
                        <div>{blockId}</div>
                    </Link>
                </td>
                <td>{isLoading ? <Spinner compact /> : payloadType}</td>
                <td className="refblocks__table__data__tx-value">{
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
                    <Link
                        to={`/${network}/block/${blockId}`}
                        className="value margin-r-t"
                    >
                        <p className="value__block-id">{blockId}</p>
                    </Link>
                </div>
                {isLoading ? <Spinner compact /> : (
                    <React.Fragment>
                        <div className="field">
                            <div className="label">
                                Payload type:
                            </div>
                            <div className="value value--payload">
                                {payloadType}
                            </div>
                        </div>
                        {transactionValue !== "--" && (
                            <div className="field">
                                <div className="label">
                                    Value:
                                </div>
                                <div className="value value--tx-value">
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

