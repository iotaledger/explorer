import {
    OutputType,
    OutputWithMetadataResponse,
    CommonOutput,
    NativeToken,
    FeatureType,
    NativeTokenFeature,
} from "@iota/sdk-wasm-nova/web";
import React, { useEffect, useState } from "react";
import Asset from "./Asset";
import Pagination from "~/app/components/Pagination";
import "./AssetsTable.scss";

interface AssetsTableProps {
    readonly outputs: OutputWithMetadataResponse[] | null;
    readonly setTokensCount?: (count: number) => void;
}

const TOKEN_PAGE_SIZE: number = 10;

const AssetsTable: React.FC<AssetsTableProps> = ({ outputs, setTokensCount }) => {
    const [tokens, setTokens] = useState<NativeToken[]>();
    const [currentPage, setCurrentPage] = useState<NativeToken[]>([]);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        if (setTokensCount) {
            setTokensCount(0);
        }

        if (outputs) {
            const theTokens: NativeToken[] = [];
            for (const outputResponse of outputs) {
                const output = outputResponse.output as CommonOutput;
                if (output.type === OutputType.Basic || output.type === OutputType.Foundry) {
                    const nativeTokenFeature = output.features?.find(
                        (feature) => feature.type === FeatureType.NativeToken,
                    ) as NativeTokenFeature;

                    if (nativeTokenFeature) {
                        const existingToken = theTokens.find((t) => t.id === nativeTokenFeature.id);
                        // Convert to BigInt again in case the amount is hex
                        const amount = BigInt(nativeTokenFeature.amount);
                        if (existingToken) {
                            existingToken.amount += amount;
                        } else {
                            theTokens.push({ id: nativeTokenFeature.id, amount });
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
    setTokensCount: undefined,
};

export default AssetsTable;
