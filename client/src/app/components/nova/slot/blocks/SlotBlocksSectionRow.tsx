import classNames from "classnames";
import React, { useState } from "react";
import { useBlock } from "~helpers/nova/hooks/useBlock";
import { useInputsAndOutputs } from "~helpers/nova/hooks/useInputsAndOutputs";
import { NameHelper } from "~helpers/nova/nameHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import Spinner from "~/app/components/Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { ISlotBlock } from "~/models/api/nova/ISlotBlocksResponse";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface Props {
    readonly slotBlock: ISlotBlock;
    readonly isTable?: boolean;
}

const SlotBlocksSectionRow: React.FC<Props> = ({ slotBlock, isTable }) => {
    const { tokenInfo, name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const blockId = slotBlock.blockId;
    const [block, isLoading] = useBlock(network, blockId);
    // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
    const [, , transferTotal] = useInputsAndOutputs(network, block);
    const [isFormattedValue, setIsFormattedValue] = useState<boolean>(true);

    let payloadType = "--";

    if (block?.isBasic()) {
        const payload = block.asBasic().payload;
        payloadType = payload ? NameHelper.getPayloadType(payload.type) : "--";
    } else {
        payloadType = "Validation";
    }
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

SlotBlocksSectionRow.defaultProps = {
    isTable: undefined,
};

export default SlotBlocksSectionRow;
