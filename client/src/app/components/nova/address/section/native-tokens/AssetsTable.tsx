import { OutputType, OutputResponse, CommonOutput, INativeToken, FeatureType, NativeTokenFeature } from "@iota/sdk-wasm-nova/web";
import React, { useEffect, useState } from "react";
import Asset from "./Asset";
import Pagination from "~/app/components/Pagination";
import { plainToInstance } from "class-transformer";
import "./AssetsTable.scss";

interface AssetsTableProps {
    readonly outputs: OutputResponse[] | null;
    readonly setTokensCount?: (count: number) => void;
}

const TOKEN_PAGE_SIZE: number = 10;

const AssetsTable: React.FC<AssetsTableProps> = ({ outputs, setTokensCount }) => {
    const [tokens, setTokens] = useState<INativeToken[]>();
    const [currentPage, setCurrentPage] = useState<INativeToken[]>([]);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        if (setTokensCount) {
            setTokensCount(0);
        }

        if (outputs) {
            const theTokens: INativeToken[] = [];
            for (const outputResponse of outputs) {
                const output = outputResponse.output as CommonOutput;
                if (output.type === OutputType.Basic || output.type === OutputType.Foundry) {
                    let nativeTokenFeature = output.features?.find((feature) => feature.type === FeatureType.NativeToken);
                    nativeTokenFeature = plainToInstance(
                        NativeTokenFeature,
                        nativeTokenFeature as NativeTokenFeature,
                    ) as unknown as NativeTokenFeature;

                    if (nativeTokenFeature) {
                        const token = nativeTokenFeature as NativeTokenFeature;
                        const existingToken = theTokens.find((t) => t.id === token.asNativeToken().id);
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
            if (setTokensCount) {
                setTokensCount(theTokens.length);
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
                            <Asset key={k} token={token} tableFormat={true} />
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/* Only visible in mobile -- Card assets*/}
            <div className="asset-cards">
                {currentPage.map((token, k) => (
                    <React.Fragment key={`${token.id}${k}`}>
                        <Asset key={k} token={token} />
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
