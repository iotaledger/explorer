import { ITransaction } from "@iota/protonet.js";
import React from "react";
import Output from "./Output";
import "./TransactionPayload.scss";
import { Link } from "react-router-dom";
import { cleanTypeName } from "../../../helpers/proto/misc";
import CopyButton from "../CopyButton";
import UnlockBlock from "./UnlockBlock";

// import Unlocks from "./Unlocks";

interface TransactionPayloadProps {
    tx: ITransaction;
    network: string;
}

const TransactionPayload: React.FC<TransactionPayloadProps> = (
    { tx, network }
) => (
    <div className="transaction-payload">
        <div className="row row--tablet-responsive fill">
            <div className="card col fill">
                <div className="card--header">
                    <h2 className="card--header__title">From</h2>
                    <span className="dot-separator">•</span>
                    <span>{tx.inputs.length}</span>
                </div>
                <div className="transaction-from card--content">
                    {tx.inputs.map((input, idx) => (
                        <Output
                            key={idx} network={network} isPreExpanded={false}
                            outputId={input.referencedOutputID?.base58 ?? ""}
                        />
                    ))}
                </div>
            </div>
            <div className="card col fill">
                <div className="card--header">
                    <h2 className="card--header__title">To</h2>
                    <span className="dot-separator">•</span>
                    <span>{tx.outputs.length}</span>
                </div>
                <div className="transaction-from card--content">
                    {tx.outputs.map((output, idx) => (
                        <Output
                            key={idx} network={network}
                            isPreExpanded={false} outputId={output.outputID.base58}
                        />
                    ))}
                </div>
            </div>
        </div>
        <div className="row row--tablet-responsive fill margin-t-m">
            <div className="card col fill">
                <div className="card--header">
                    <h2 className="card--header__title">Unlock Blocks</h2>
                    <span className="dot-separator">•</span>
                    <span>{tx.unlockBlocks.length}</span>
                </div>
                <div className="transaction-from card--content">
                    {tx.unlockBlocks.map((unlockBlock, i) => (
                        <UnlockBlock key={i} unlockBlock={unlockBlock} isPreExpanded={false} />
                        )
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default TransactionPayload;

