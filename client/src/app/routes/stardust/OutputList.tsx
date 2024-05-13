import React from "react";
import { RouteComponentProps } from "react-router-dom";
import OutputListProps from "./OutputListProps";
import { useTaggedOutputs } from "~helpers/stardust/hooks/useTaggedOutputs";
import TabbedSection from "../../components/hoc/TabbedSection";
import Pagination from "../../components/Pagination";
import Output from "../../components/stardust/Output";
import "./OutputList.scss";

const OUTPUTS_OVER_LIMIT_MESSAGE = "There are more than 100 outputs with this tag, only the first 100 are shown.";

export enum OUTPUT_LIST_TABS {
    Basic = "Basic outputs",
    Nft = "Nft outputs",
}

const OutputList: React.FC<RouteComponentProps<OutputListProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const [
        tag,
        currentPageBasic,
        currentPageNft,
        totalBasicItems,
        totalNftItems,
        pageNumberBasic,
        pageNumberNft,
        setPageNumberBasic,
        setPageNumberNft,
        pageSize,
        isBasicLoading,
        isNftLoading,
        basicOutputLimitReached,
        nftOutputLimitReached,
        hasMoreBasicOutputs,
        hasMoreNftOutputs,
        loadMoreCallback,
    ] = useTaggedOutputs(network);

    return (
        <div className="output-list">
            <div className="wrapper">
                <div className="inner">
                    <div className="output-list--header">
                        <div className="row middle">
                            <h1>{`Outputs with tag "${tag}"`}</h1>
                        </div>
                    </div>
                    <TabbedSection
                        tabsEnum={OUTPUT_LIST_TABS}
                        tabOptions={{
                            [OUTPUT_LIST_TABS.Basic]: {
                                disabled: isBasicLoading || totalBasicItems === 0,
                                isLoading: isBasicLoading,
                            },
                            [OUTPUT_LIST_TABS.Nft]: {
                                disabled: isNftLoading || totalNftItems === 0,
                                isLoading: isNftLoading,
                            },
                        }}
                    >
                        <div className="output-list__basic">
                            {currentPageBasic.length > 0 && (
                                <div className="section margin-b-s">
                                    {currentPageBasic.map((item, index) => (
                                        <div key={index} className="card margin-b-t">
                                            <Output
                                                network={network}
                                                outputId={item.outputId}
                                                output={item.outputDetails.output}
                                                amount={Number(item.outputDetails.output.amount)}
                                                showCopyAmount={true}
                                                preExpandedConfig={{ isPreExpanded: false }}
                                            />
                                        </div>
                                    ))}
                                    {totalBasicItems > pageSize && (
                                        <Pagination
                                            currentPage={pageNumberBasic}
                                            totalCount={totalBasicItems}
                                            pageSize={pageSize}
                                            siblingsCount={1}
                                            onPageChange={(page) => setPageNumberBasic(page)}
                                        />
                                    )}
                                    {basicOutputLimitReached ? (
                                        hasMoreBasicOutputs && <div className="card outputs-over-limit">{OUTPUTS_OVER_LIMIT_MESSAGE}</div>
                                    ) : (
                                        <div className="card load-more--button">
                                            <button type="button" onClick={async () => loadMoreCallback("basic")} disabled={isBasicLoading}>
                                                Load more...
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="output-list__nft">
                            {currentPageNft.length > 0 && (
                                <div className="section margin-b-s">
                                    {currentPageNft.map((item, index) => (
                                        <div key={index} className="card margin-b-t">
                                            <Output
                                                network={network}
                                                outputId={item.outputId}
                                                output={item.outputDetails.output}
                                                amount={Number(item.outputDetails.output.amount)}
                                                showCopyAmount={true}
                                                preExpandedConfig={{ isPreExpanded: false }}
                                            />
                                        </div>
                                    ))}
                                    {totalNftItems > pageSize && (
                                        <Pagination
                                            currentPage={pageNumberNft}
                                            totalCount={totalNftItems}
                                            pageSize={pageSize}
                                            siblingsCount={1}
                                            onPageChange={(page) => setPageNumberNft(page)}
                                        />
                                    )}
                                    {nftOutputLimitReached ? (
                                        hasMoreNftOutputs && <div className="card outputs-over-limit">{OUTPUTS_OVER_LIMIT_MESSAGE}</div>
                                    ) : (
                                        <div className="card load-more--button">
                                            <button type="button" onClick={async () => loadMoreCallback("nft")} disabled={isNftLoading}>
                                                Load more...
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabbedSection>
                </div>
            </div>
        </div>
    );
};

export default OutputList;
