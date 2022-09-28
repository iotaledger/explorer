import { ALIAS_OUTPUT_TYPE, BASIC_OUTPUT_TYPE,
    FOUNDRY_OUTPUT_TYPE, NFT_OUTPUT_TYPE, OutputTypes } from "@iota/iota.js-stardust";
import React, { useEffect, useState } from "react";
import ITokenDetails from "../../routes/stardust/ITokenDetails";
import Modal from "../Modal";
import Pagination from "../Pagination";
import assetsMessage from "./../../../assets/modals/stardust/address/assets-in-wallet.json";
import Asset from "./Asset";
import "./AssetsTable.scss";

interface AssetsTableProps {
    networkId: string;
    outputs: OutputTypes[] | undefined;
}

const TOKEN_PAGE_SIZE: number = 10;

const AssetsTable: React.FC<AssetsTableProps> = ({ networkId, outputs }) => {
    const [tokens, setTokens] = useState<ITokenDetails[]>();
    const [currentPage, setCurrentPage] = useState<ITokenDetails[]>([]);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        if (outputs) {
            const theTokens: ITokenDetails[] = [];
            for (const output of outputs) {
                if (output.type === BASIC_OUTPUT_TYPE || output.type === ALIAS_OUTPUT_TYPE ||
                   output.type === FOUNDRY_OUTPUT_TYPE || output.type === NFT_OUTPUT_TYPE) {
                    for (const token of output.nativeTokens ?? []) {
                        const existingToken = theTokens.find(t => t.name === token.id);
                        if (existingToken) {
                            existingToken.amount += Number(token.amount);
                        } else {
                            theTokens.push({ name: token.id, amount: Number.parseInt(token.amount, 16) });
                        }
                    }
                }
            }

            setTokens(theTokens);
        }
    }, [outputs]);

    useEffect(() => {
        const from = (pageNumber - 1) * TOKEN_PAGE_SIZE;
        const to = from + TOKEN_PAGE_SIZE;
        if (tokens) {
            setCurrentPage(tokens.slice(from, to));
        }
    }, [tokens, pageNumber]);

    return (
        tokens && tokens?.length > 0 ? (
            <div className="section transaction--section">
                <div className="section--header row space-between">
                    <div className="row middle">
                        <h2>
                            Assets in Wallet ({tokens?.length})
                        </h2>
                        <Modal icon="info" data={assetsMessage} />
                    </div>
                </div>
                <table className="asset-table">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Symbol</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        { currentPage.map((token, k) => (
                            <React.Fragment key={`${token?.name}${k}`}>
                                <Asset
                                    key={k}
                                    name={token?.name}
                                    network={networkId}
                                    symbol={token?.symbol}
                                    amount={token.amount}
                                    price={token?.price}
                                    value={token?.value}
                                    tableFormat={true}
                                />
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Only visible in mobile -- Card assets*/}
                <div className="asset-cards">
                    {currentPage.map((token, k) => (
                        <React.Fragment key={`${token?.name}${k}`}>
                            <Asset
                                key={k}
                                name={token?.name}
                                network={networkId}
                                symbol={token?.symbol}
                                amount={token?.amount}
                                price={token?.price}
                                value={token?.value}
                            />
                        </React.Fragment>
                    ))}
                </div>
                <Pagination
                    currentPage={pageNumber}
                    totalCount={tokens?.length ?? 0}
                    pageSize={TOKEN_PAGE_SIZE}
                    siblingsCount={1}
                    onPageChange={number => setPageNumber(number)}
                />
            </div>
        ) : null
    );
};

export default AssetsTable;
