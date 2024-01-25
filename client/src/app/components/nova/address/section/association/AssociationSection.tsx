import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ASSOCIATION_TYPE_TO_LABEL } from "./AssociatedOutputsUtils";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import { useOutputsDetails } from "~helpers/nova/hooks/useOutputsDetails";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { AssociationType } from "~models/api/nova/IAssociationsResponse";
import Spinner from "../../../../Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import "./AssociationSection.scss";

interface IAssociatedSectionProps {
    readonly association: AssociationType;
    readonly outputIds: string[] | undefined;
}

interface IOutputTableItem {
    outputId: string;
    amount: string;
}

const PAGE_SIZE = 10;

const AssociationSection: React.FC<IAssociatedSectionProps> = ({ association, outputIds }) => {
    const { tokenInfo, name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormatBalance, setIsFormatBalance] = useState(false);
    const [loadMoreCounter, setLoadMoreCounter] = useState<number | undefined>();
    const [sliceToLoad, setSliceToLoad] = useState<string[]>([]);
    const [outputTableItems, setOutputTableItems] = useState<IOutputTableItem[]>([]);
    const [outputsDetails, isLoading] = useOutputsDetails(network, sliceToLoad);

    useEffect(() => {
        const loadedOutputItems: IOutputTableItem[] = [...outputTableItems];

        for (const details of outputsDetails) {
            const { output, metadata } = details.outputDetails;
            const outputId = details.outputId;

            if (output && metadata) {
                const amount = output.amount;
                loadedOutputItems.push({ outputId, amount });
            }
        }
        setOutputTableItems(loadedOutputItems);
    }, [outputsDetails]);

    useEffect(() => {
        if (outputIds && loadMoreCounter !== undefined) {
            const from = loadMoreCounter * PAGE_SIZE;
            const to = from + PAGE_SIZE;
            setSliceToLoad(outputIds.slice(from, to));
        }
    }, [outputIds, loadMoreCounter]);

    const onExpandSection = () => {
        setIsExpanded(!isExpanded);
        if (loadMoreCounter === undefined) {
            setLoadMoreCounter(0);
        }
    };

    const onLoadMore = () => {
        setLoadMoreCounter(loadMoreCounter === undefined ? 0 : loadMoreCounter + 1);
    };

    const count = outputIds?.length;

    return count ? (
        <div className="section association-section">
            <div className="row association-section--header middle pointer" onClick={onExpandSection}>
                <div className={classNames("margin-r-t", "dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <h3 className="association-label">
                    {ASSOCIATION_TYPE_TO_LABEL[association]} ({count})
                </h3>
                {isExpanded && isLoading && (
                    <div className="margin-l-t">
                        <Spinner />
                    </div>
                )}
            </div>
            {!isExpanded || outputTableItems.length === 0 ? null : (
                <React.Fragment>
                    <table className="association-section--table">
                        <thead>
                            <tr>
                                <th>OUTPUT ID</th>
                                <th>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {outputTableItems.map((details, idx) => {
                                const { outputId, amount } = details;

                                return (
                                    <tr key={idx}>
                                        <td className="association__output">
                                            <TruncatedId id={outputId} link={`/${network}/output/${outputId}`} showCopyButton />
                                        </td>
                                        <td className="amount">
                                            <span onClick={() => setIsFormatBalance(!isFormatBalance)} className="pointer margin-r-5">
                                                {formatAmount(Number(amount), tokenInfo, isFormatBalance)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="association-section--cards">
                        {outputTableItems.map((details, idx) => {
                            const { outputId, amount } = details;

                            return (
                                <div key={idx} className="card">
                                    <div className="field">
                                        <div className="label">Output Id</div>
                                        <Link to={`/${network}/output/${outputId}`} className="row margin-r-t value highlight">
                                            <TruncatedId id={outputId} />
                                        </Link>
                                    </div>
                                    <div className="field">
                                        <div className="label">Amount</div>
                                        <div className="value amount">
                                            <span onClick={() => setIsFormatBalance(!isFormatBalance)} className="pointer margin-r-5">
                                                {formatAmount(Number(amount), tokenInfo, isFormatBalance)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {outputTableItems.length < count && (
                        <div className="card load-more--button">
                            <button onClick={onLoadMore} type="button" disabled={isLoading}>
                                Load more...
                            </button>
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    ) : null;
};

export default AssociationSection;
