import { OutputType, OutputResponse, CommonOutput } from "@iota/sdk-wasm-stardust/web";
import React, { useEffect, useState } from "react";
import Asset from "./Asset";
import { IToken } from "~models/api/stardust/foundry/IToken";
import Pagination from "../../../../Pagination";
import "./AssetsTable.scss";

interface AssetsTableProps {
    readonly networkId: string;
    readonly outputs: OutputResponse[] | null;
    readonly setTokenCount?: (count: number) => void;
}

const TOKEN_PAGE_SIZE: number = 10;

const AssetsTable: React.FC<AssetsTableProps> = ({ networkId, outputs, setTokenCount }) => {
    const [tokens, setTokens] = useState<IToken[]>();
    const [currentPage, setCurrentPage] = useState<IToken[]>([]);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        if (setTokenCount) {
            setTokenCount(0);
        }

        if (outputs) {
            const theTokens: IToken[] = [];
            for (const outputResponse of outputs) {
                const output = outputResponse.output;
                if (
                    output.type === OutputType.Basic ||
                    output.type === OutputType.Alias ||
                    output.type === OutputType.Foundry ||
                    output.type === OutputType.Nft
                ) {
                    for (const token of (output as CommonOutput).nativeTokens ?? []) {
                        const existingToken = theTokens.find((t) => t.id === token.id);
                        // Convert to BigInt again in case the amount is hex
                        const amount = BigInt(token.amount);
                        if (existingToken) {
                            existingToken.amount += amount;
                        } else {
                            theTokens.push({ id: token.id, amount });
                        }
                    }
                }
            }

            setTokens(theTokens);
            if (setTokenCount) {
                setTokenCount(theTokens.length);
            }
        }
    }, [outputs]);

    useEffect(() => {
        const from = (pageNumber - 1) * TOKEN_PAGE_SIZE;
        const to = from + TOKEN_PAGE_SIZE;
        if (tokens) {
            setCurrentPage(tokens.slice(from, to));
        }
    }, [tokens, pageNumber]);

    return tokens && tokens?.length > 0 ? (
        <div className="section">
            <table className="asset-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Symbol</th>
                        <th>Token id</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPage.map((token, k) => (
                        <React.Fragment key={`${token.id}${k}`}>
                            <Asset key={k} token={token} network={networkId} tableFormat={true} />
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/* Only visible in mobile -- Card assets*/}
            <div className="asset-cards">
                {currentPage.map((token, k) => (
                    <React.Fragment key={`${token.id}${k}`}>
                        <Asset key={k} token={token} network={networkId} />
                    </React.Fragment>
                ))}
            </div>
            <Pagination
                currentPage={pageNumber}
                totalCount={tokens?.length ?? 0}
                pageSize={TOKEN_PAGE_SIZE}
                siblingsCount={1}
                onPageChange={(number) => setPageNumber(number)}
            />
        </div>
    ) : null;
};

AssetsTable.defaultProps = {
    setTokenCount: undefined,
};

export default AssetsTable;
