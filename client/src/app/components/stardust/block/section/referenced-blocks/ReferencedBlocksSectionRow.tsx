import classNames from "classnames";
import React, { useContext, useState } from "react";
import { useBlock } from "~helpers/stardust/hooks/useBlock";
import { useInputsAndOutputs } from "~helpers/stardust/hooks/useInputsAndOutputs";
import { NameHelper } from "~helpers/stardust/nameHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "../../../../../context/NetworkContext";
import Spinner from "../../../../Spinner";
import TruncatedId from "../../../TruncatedId";

interface Props {
    readonly blockId: string;
    readonly isTable?: boolean;
}

const ReferencedBlocksSectionRow: React.FC<Props> = ({ blockId, isTable }) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);
    const [block, isLoading] = useBlock(network, blockId);
    // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
    const [, , , transferTotal] = useInputsAndOutputs(network, block);
    const [isFormattedValue, setIsFormattedValue] = useState<boolean>(true);

    const payloadType = NameHelper.getPayloadType(block ?? undefined);
    const transactionValue = transferTotal ? formatAmount(Number(transferTotal), tokenInfo, !isFormattedValue) : "--";

    return isTable ? (
        <tr>
            <td className="refblocks__block-id">
                <TruncatedId id={blockId} link={`/${network}/block/${blockId}`} />
            </td>
            <td>{isLoading ? <Spinner compact /> : payloadType}</td>
            <td className="refblocks__tx-value">
                {isLoading ? (
                    <Spinner compact />
                ) : (
                    <div
                        onClick={() => setIsFormattedValue(!isFormattedValue)}
                        className={classNames({ pointer: transactionValue !== "--" })}
                    >
                        {transactionValue}
                    </div>
                )}
            </td>
        </tr>
    ) : (
        <div className="card">
            <div className="field">
                <div className="label">Block Id:</div>
                <div className="card--value value__block-id">
                    <TruncatedId id={blockId} link={`/${network}/block/${blockId}`} />
                </div>
            </div>
            {isLoading ? (
                <Spinner compact />
            ) : (
                <React.Fragment>
                    <div className="field">
                        <div className="label">Payload type:</div>
                        <div className="card--value card--value--payload">{payloadType}</div>
                    </div>
                    {transactionValue !== "--" && (
                        <div className="field">
                            <div className="label">Value:</div>
                            <div className="card--value card--value--tx-value">
                                <span onClick={() => setIsFormattedValue(!isFormattedValue)} className="pointer margin-r-5">
                                    {transactionValue}
                                </span>
                            </div>
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    );
};

ReferencedBlocksSectionRow.defaultProps = {
    isTable: undefined,
};

export default ReferencedBlocksSectionRow;
