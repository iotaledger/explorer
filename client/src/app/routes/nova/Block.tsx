
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useBlock } from "~helpers/nova/hooks/useBlock";
import NotFound from "../../components/NotFound";

export interface BlockProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The block to lookup.
     */
    blockId: string;
}

const Block: React.FC<RouteComponentProps<BlockProps>> = (
    { history, match: { params: { network, blockId } } }
) => {

    const [block, ,blockError] = useBlock(network, blockId);

    if (blockError) {
        return (
            <div className="block">
                <div className="wrapper">
                    <div className="inner">
                        <NotFound
                            searchTarget="block"
                            query={blockId}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="block">
            <div className="wrapper">
                <div className="inner">
                    <div className="section">{JSON.stringify(block)}</div>
                </div>
            </div>
        </div>
    );
};

export default Block;

