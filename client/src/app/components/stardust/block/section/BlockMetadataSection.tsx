import { HexEncodedString, IBlockMetadata } from "@iota/sdk-wasm-stardust/web";
import React from "react";
import Spinner from "../../../Spinner";
import InclusionState from "../../InclusionState";
import TruncatedId from "../../TruncatedId";

interface BlockMetadataSectionProps {
    readonly network: string;
    readonly metadata?: IBlockMetadata;
    readonly metadataError?: string;
    readonly blockChildren?: HexEncodedString[] | null;
    readonly conflictReason?: string;
    readonly isLinksDisabled: boolean;
}

const BlockMetadataSection: React.FC<BlockMetadataSectionProps> = ({
    network,
    metadata,
    metadataError,
    blockChildren,
    conflictReason,
    isLinksDisabled,
}) => (
    <div className="section metadata-section">
        <div className="section--data">
            {!metadata && !metadataError && <Spinner />}
            {metadataError && <p className="danger">Failed to retrieve metadata. {metadataError}</p>}
            {metadata && !metadataError && (
                <React.Fragment>
                    <div className="section--data">
                        <div className="label">Is Solid</div>
                        <div className="value row middle">
                            <span className="margin-r-t">{metadata?.isSolid ? "Yes" : "No"}</span>
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">Inclusion Status</div>
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
                    <div className="section--data row row--tablet-responsive">
                        {metadata?.parents && (
                            <div className="truncate margin-b-s margin-r-m">
                                <div className="label">Parents</div>
                                {metadata.parents.map((parent, idx) => (
                                    <div key={idx} style={{ marginTop: "8px" }} className="value code link">
                                        <TruncatedId id={parent} link={isLinksDisabled ? undefined : `/${network}/block/${parent}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                        {blockChildren && (
                            <div className="truncate">
                                <div className="label">Children</div>
                                {blockChildren.map((child, idx) => (
                                    <div key={idx} style={{ marginTop: "8px" }} className="value code link">
                                        <TruncatedId id={child} link={isLinksDisabled ? undefined : `/${network}/block/${child}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </React.Fragment>
            )}
        </div>
    </div>
);

BlockMetadataSection.defaultProps = {
    blockChildren: undefined,
    conflictReason: undefined,
    metadata: undefined,
    metadataError: undefined,
};

export default BlockMetadataSection;
