import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useTaggedOutputs } from "~helpers/nova/hooks/useTaggedOutputs";
import TabbedSection from "~/app/components/hoc/TabbedSection";
import Pagination from "~/app/components/Pagination";
import OutputView from "~/app/components/nova/OutputView";
import "./OutputsPage.scss";

interface OutputsPageProps {
    /**
     * The network to lookup.
     */
    network: string;
}

const OUTPUTS_OVER_LIMIT_MESSAGE = "There are more than 100 outputs with this tag, only the first 100 are shown.";

export enum OUTPUTS_PAGE_TABS {
    Basic = "Basic outputs",
    Nft = "Nft outputs",
}

const OutputsPage: React.FC<RouteComponentProps<OutputsPageProps>> = ({
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
                        tabsEnum={OUTPUTS_PAGE_TABS}
                        tabOptions={{
                            [OUTPUTS_PAGE_TABS.Basic]: {
                                disabled: isBasicLoading || totalBasicItems === 0,
                                isLoading: isBasicLoading,
                            },
                            [OUTPUTS_PAGE_TABS.Nft]: {
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
                                            <OutputView outputId={item.outputId} output={item.outputDetails.output} showCopyAmount={true} />
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
                                            <OutputView outputId={item.outputId} output={item.outputDetails.output} showCopyAmount={true} />
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

export default OutputsPage;
