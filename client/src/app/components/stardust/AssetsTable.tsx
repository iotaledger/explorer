import {
    ALIAS_OUTPUT_TYPE, BASIC_OUTPUT_TYPE,
    FOUNDRY_OUTPUT_TYPE, IFoundryOutput, IMetadataFeature, METADATA_FEATURE_TYPE, NFT_OUTPUT_TYPE, OutputTypes
} from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import * as jsonschema from "jsonschema";
import React, { useEffect, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { ITokenDetails } from "../../../models/api/stardust/foundry/ITokenDetails";
import { ITokenSchemaIRC30 } from "../../../models/api/stardust/foundry/ITokenSchemaIRC30";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Modal from "../Modal";
import Pagination from "../Pagination";
import assetsMessage from "./../../../assets/modals/stardust/address/assets-in-wallet.json";
import tokenSchemeIRC30 from "./../../../assets/schemas/token-schema-IRC30.json";
import Asset from "./Asset";
import "./AssetsTable.scss";

interface AssetsTableProps {
    networkId: string;
    outputs: OutputTypes[] | undefined;
    setTokenCount?: React.Dispatch<React.SetStateAction<number>>;
}

const TOKEN_PAGE_SIZE: number = 10;

const AssetsTable: React.FC<AssetsTableProps> = ({ networkId, outputs, setTokenCount }) => {
    const [tokens, setTokens] = useState<ITokenDetails[]>();
    const [currentPage, setCurrentPage] = useState<ITokenDetails[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [jobToStatus, setJobToStatus] = useState(
        new Map<string, PromiseStatus>()
    );
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const validator = new jsonschema.Validator();

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
                            theTokens.push({ id: token.id, amount: Number.parseInt(token.amount, 16) });
                            // eslint-disable-next-line no-void
                            void loadTokenDetails(networkId, token.id);
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

    const loadTokenDetails = async (network: string, foundryId: string): Promise<void> => {
        const foundryLoadMonitor = new PromiseMonitor(status => {
            setJobToStatus(jobToStatus.set(`loadFoundryDetails-${foundryId}`, status));
        });
        // eslint-disable-next-line no-void
        void foundryLoadMonitor.enqueue(
            async () => tangleCacheService.foundryDetails({ network, foundryId }).then(
                response => {
                    if (!response.error) {
                        const immutableFeatures = (response.foundryDetails?.output as IFoundryOutput).immutableFeatures;

                        const metadata = immutableFeatures?.find(
                            feature => feature.type === METADATA_FEATURE_TYPE
                        ) as IMetadataFeature;

                        if (metadata) {
                            updateTokenInfo(foundryId, metadata);
                        }
                    }
                }).catch(_ => { })
        );
    };

    const updateTokenInfo = (tokenId: string, metadata: IMetadataFeature): void => {
        const theTokens: ITokenDetails[] = [...tokens ?? []];

        try {
            const tokenInfo = JSON.parse(Converter.hexToUtf8(metadata.data)) as ITokenSchemaIRC30;
            const result = validator.validate(tokenInfo, tokenSchemeIRC30);

            if (result.valid) {
                const index = theTokens?.findIndex(token => token.id === tokenId);
                    theTokens[index] = {
                        ...theTokens[index],
                        ...tokenInfo
                    };
            }
        } catch {}

        if (theTokens.length > 0) {
            setTokens(theTokens);
        }
    };

    return (
        tokens && tokens?.length > 0 ? (
            <div className="section">
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
                            <th>Name</th>
                            <th>Symbol</th>
                            <th>Token id</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPage.map((token, k) => (
                            <React.Fragment key={`${token.id}${k}`}>
                                <Asset
                                    key={k}
                                    token={token}
                                    network={networkId}
                                    tableFormat={true}
                                    isLoading={jobToStatus.get(`loadFoundryDetails-${token.id}`) !== PromiseStatus.DONE}
                                />
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Only visible in mobile -- Card assets*/}
                <div className="asset-cards">
                    {currentPage.map((token, k) => (
                        <React.Fragment key={`${token.id}${k}`}>
                            <Asset
                                key={k}
                                token={token}
                                network={networkId}
                                isLoading={jobToStatus.get(`loadFoundryDetails-${token.id}`) !== PromiseStatus.DONE}
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

AssetsTable.defaultProps = {
    setTokenCount: undefined
};

export default AssetsTable;
