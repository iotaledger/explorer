import { IBlockMetadata } from "@iota/iota.js-stardust";
import * as H from "history";
import React from "react";
import Spinner from "../Spinner";
import InclusionState from "./InclusionState";
import TruncatedId from "./TruncatedId";

interface BlockMetadataSectionProps {
    network: string;
    metadata?: IBlockMetadata;
    metadataError?: string;
    conflictReason?: string;
    isLinksDisabled: boolean;
    history: H.History;
}

const BlockMetadataSection: React.FC<BlockMetadataSectionProps> = (
    { network, metadata, metadataError, conflictReason, isLinksDisabled, history }
) => (
    <div className="section metadata-section">
        <div className="section--data">
            {!metadata && !metadataError && (<Spinner />)}
            {metadataError && (
                <p className="danger">Failed to retrieve metadata. {metadataError}</p>
            )}
            {metadata && !metadataError && (
                <React.Fragment>
                    <div className="section--data">
                        <div className="label">Is Solid</div>
                        <div className="value row middle">
                            <span className="margin-r-t">
                                {metadata?.isSolid ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">
                            Ledger Inclusion
                        </div>
                        <div className="value row middle">
                            <InclusionState state={metadata?.ledgerInclusionState} />
                        </div>
                    </div>
                    {conflictReason && (
                        <div className="section--data">
                            <div className="label">Conflict Reason</div>
                            <div className="value">{conflictReason}</div>
                        </div>
                    )}
                    {metadata?.parents && (
                        <div className="section--data">
                            <div className="label">
                                Parents
                            </div>
                            {metadata.parents.map((parent, idx) => (
                                <div
                                    key={idx}
                                    style={{ marginTop: "8px" }}
                                    className="value code link"
                                >
                                    <TruncatedId
                                        id={parent}
                                        link={isLinksDisabled ? undefined : `/${network}/block/${parent}`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    </div>
);

BlockMetadataSection.defaultProps = {
    conflictReason: undefined,
    metadata: undefined,
    metadataError: undefined
};

export default BlockMetadataSection;

