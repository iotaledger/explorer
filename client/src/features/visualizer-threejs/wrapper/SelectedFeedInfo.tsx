import React from "react";
import { Link } from "react-router-dom";
import BlockTangleState from "~/app/components/nova/block/BlockTangleState";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import CloseIcon from "~assets/close.svg?react";
import { useTangleStore } from "../store";
import { INetwork } from "~models/config/INetwork";
import { useBlockMetadata } from "~/helpers/nova/hooks/useBlockMetadata";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import "./KeyPanel.scss";

export const SelectedFeedInfo = ({
    network,
    selectedFeedItem,
    networkConfig,
}: {
    readonly networkConfig: INetwork;
    readonly network: string;
    readonly selectedFeedItem: IFeedBlockData;
}) => {
    const setClickedInstanceId = useTangleStore((state) => state.setClickedInstanceId);
    const [selectedBlockMetadata, isMetadataLoading] = useBlockMetadata(network, selectedFeedItem.blockId);

    return (
        <div className="info-panel card padding-m">
            <div className="row middle spread">
                <button type="button" className="icon-button" onClick={() => setClickedInstanceId(null)}>
                    <CloseIcon />
                </button>
            </div>
            <div className="col">
                <div className="card--content">
                    <div className="card--label">
                        Block
                        <span className="margin-l-t">
                            {selectedBlockMetadata.metadata && !isMetadataLoading && (
                                <BlockTangleState
                                    status={selectedBlockMetadata.metadata.blockState}
                                    issuingTime={selectedFeedItem.block.header.issuingTime}
                                />
                            )}
                        </span>
                    </div>
                    <div className="card--value overflow-ellipsis">
                        <Link to={`/${networkConfig.network}/block/${selectedFeedItem?.blockId}`} target="_blank">
                            <TruncatedId id={selectedFeedItem.blockId} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
