import React from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { useAddress } from "../../../helpers/proto/useAddress";
import { useBlock } from "../../../helpers/proto/useBlock";
import { useConflict } from "../../../helpers/proto/useConflict";
import { useOutput } from "../../../helpers/proto/useOutput";
import { useSlot } from "../../../helpers/proto/useSlot";
import { useTx } from "../../../helpers/proto/useTx";
import Spinner from "../../components/Spinner";
import "./Search.scss";

interface SearchProps {
    network: string;
    query: string;
}

const Search: React.FC<RouteComponentProps<SearchProps>> = (
    { match: { params: { network, query } } }
) => {
    const [tx, isTxLoading] = useTx(network, query);
    const [block, , isBlockLoading] = useBlock(network, query);
    const [conflict, isConflictLoading] = useConflict(network, query);
    const [address, isAddressLoading] = useAddress(network, query);
    const [output, isOutputLoading] = useOutput(network, query);
    const slotIndex = Number.parseInt(query, 10);
    const [slot, isSlotLoading] = slotIndex ? useSlot(network, "", slotIndex) : useSlot(network, query);

    const isSearching = isTxLoading || isBlockLoading || isConflictLoading ||
        isAddressLoading || isOutputLoading || isSlotLoading;

    if (!isSearching) {
        if (block) {
            return <Redirect to={`/${network}/block/${query}`} />;
        }
        if (conflict) {
            return <Redirect to={`/${network}/conflict/${query}`} />;
        }
        if (output) {
            return <Redirect to={`/${network}/output/${query}`} />;
        }
        if (tx) {
            return <Redirect to={`/${network}/transaction/${query}`} />;
        }
        if (slot) {
            return <Redirect to={`/${network}/slot/${query}`} />;
        }
        if (address) {
            return <Redirect to={`/${network}/address/${query}`} />;
        }
    }

    return (
        <div className="search">
            <div className="wrapper">
                <div className="inner">
                    <h1 className="margin-b-s">
                        Search
                    </h1>
                    {isSearching && (
                        <div className="card">
                            <div className="card--header">
                                <h2>Searching</h2>
                            </div>
                            <div className="card--content middle row">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    {!isSearching && (
                        <div className="card">
                            <div className="card--header">
                                <h2>Not found</h2>
                            </div>
                            <div className="card--content">
                                <p>
                                    We could not find any blocks, addresses, outputs or slots
                                    for the query.
                                </p>
                                <br />
                                <div className="card--value">
                                    <ul>
                                        <li>
                                            <span>Query</span>
                                            <span>{query}</span>
                                        </li>
                                    </ul>
                                </div>
                                <br />
                                <p>The following formats are supported:</p>
                                <br />
                                <ul>
                                    <li>
                                        <span>Slots</span>
                                        <span>Numeric or 47 base58 characters (incl. slot index)</span>
                                    </li>
                                    <li>
                                        <span>Blocks</span>
                                        <span>47 base58 characters (incl. slot index)</span>
                                    </li>
                                    <li>
                                        <span>Addresses</span>
                                        <span>44 base58 characters</span>
                                    </li>
                                    <li>
                                        <span>Conflicts</span>
                                        <span>44 base58 characters</span>
                                    </li>
                                    <li>
                                        <span>Transactions</span>
                                        <span>44 base58 characters</span>
                                    </li>
                                    <li>
                                        <span>Outputs</span>
                                        <span>47 base58 characters</span>
                                    </li>
                                </ul>
                                <br />
                                <p>Please perform another search with a valid input.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
