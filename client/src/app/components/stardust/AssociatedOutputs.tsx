/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import { IOutputResponse } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { AssociationType, IAssociatedOutput } from "../../../models/api/stardust/IAssociatedOutputsResponse";
import { STARDUST } from "../../../models/db/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Pagination from "../../components/Pagination";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import "./AssociatedOutputs.scss";
import Output from "./Output";

interface AssociatedOutputsProps {
    /**
     * The network in context.
     */
    network: string;
    /**
     * Bech32 address
     */
    address: string;
}

interface OutputIdToOutputDetailsMap {
    [outputId: string]: IOutputResponse;
}

const ASSOCIATION_TYPE_TO_LABEL = {
    [AssociationType.BASIC_SENDER]: "Sender Block Feature",
    [AssociationType.BASIC_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.BASIC_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.ALIAS_STATE_CONTROLLER]: "State Controller Address Unlock Condition",
    [AssociationType.ALIAS_GOVERNOR]: "Governor Address Unlock Condition",
    [AssociationType.ALIAS_ISSUER]: "Issuer Block Feature",
    [AssociationType.ALIAS_SENDER]: "Sender Block Feature",
    [AssociationType.FOUNDRY_ALIAS]: "Immutable Alias Address Unlock Condition",
    [AssociationType.NFT_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.NFT_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.NFT_SENDER]: "Sender Block Feature"
};

const PAGE_SIZE = 10;

/**
 * Component to render the Associated Outputs section.
 */
const AssociatedOutputs: React.FC<AssociatedOutputsProps> = ({ network, address }) => {
    const [associatedOutputs, setAssociatedOutputs] = useState<IAssociatedOutput[] | null>(null);
    const [outputDetails, setOutputDetails] = useState<OutputIdToOutputDetailsMap>({});
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [showOutputDetails, setShowOutputDetails] = useState(-1);

    useEffect(() => {
        const loadAssociatedOutputs = async () => {
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
            const associatedOutputsResponse = await tangleCacheService.associatedOutputs(network, address);

            if (associatedOutputsResponse?.outputs) {
                setAssociatedOutputs(associatedOutputsResponse.outputs);
            }
        };

        /* eslint-disable @typescript-eslint/no-floating-promises */
        loadAssociatedOutputs();
    }, [network, address]);

    useEffect(() => {
        if (associatedOutputs) {
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

            for (const associatedOutput of associatedOutputs) {
                const outputId = associatedOutput.outputId;
                tangleCacheService.outputDetails(network, outputId).then(output => {
                    if (output && !(outputId in outputDetails)) {
                        const updatedOutputDetails = { ...outputDetails, [outputId]: output };
                        setOutputDetails(updatedOutputDetails);
                    }
                });
            }
        }
    }, [associatedOutputs]);

    return (
        associatedOutputs ?
            <div className="section">
                <div className="section--header"><h2>Associated Outputs</h2></div>
                <table className="associated--table">
                    <thead>
                        <tr>
                            <th>Output type</th>
                            <th>Address found in</th>
                            <th>Date created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {associatedOutputs.map((associatedOutput, idx) => {
                            if (!(associatedOutput.outputId in outputDetails)) {
                                return null;
                            }

                            const output = outputDetails[associatedOutput.outputId].output;
                            const outputMetadata = outputDetails[associatedOutput.outputId].metadata;
                            const outputLabel = NameHelper.getOutputTypeName(output.type);
                            const dateCreated = DateHelper.formatShort(outputMetadata.milestoneTimestampBooked * 1000);
                            const associationLabel = ASSOCIATION_TYPE_TO_LABEL[associatedOutput.association];

                            return (
                                <tr key={idx}>
                                    <td className="card">
                                        <div
                                            className="output--label"
                                            onClick={() => setShowOutputDetails(
                                                showOutputDetails === idx ? -1 : idx
                                            )}
                                        >
                                            <div className={classNames(
                                                "dropdown--icon", "margin-r-t", { opened: showOutputDetails === idx }
                                            )}
                                            >
                                                <DropdownIcon />
                                            </div>
                                            <button type="button" className="margin-r-t color">
                                                {outputLabel}
                                            </button>
                                        </div>
                                        {showOutputDetails === idx && (
                                            <Output
                                                key={idx}
                                                id={associatedOutput.outputId}
                                                output={output}
                                                amount={Number(output.amount)}
                                                network={network}
                                            />
                                        )}
                                    </td>
                                    <td>{associationLabel}</td>
                                    <td>{dateCreated}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* ----- Only visible on mobile ----- */}
                <div className="associated--cards">
                    {associatedOutputs.map((associatedOutput, idx) => {
                        if (!(associatedOutput.outputId in outputDetails)) {
                            return null;
                        }

                        const output = outputDetails[associatedOutput.outputId].output;
                        const outputMetadata = outputDetails[associatedOutput.outputId].metadata;
                        const outputLabel = NameHelper.getOutputTypeName(output.type);
                        const dateCreated = DateHelper.formatShort(outputMetadata.milestoneTimestampBooked * 1000);
                        const associationLabel = ASSOCIATION_TYPE_TO_LABEL[associatedOutput.association];

                        return (
                            <div className="card" key={idx}>
                                <div className="field">
                                    <div className="label">
                                        Output type
                                    </div>
                                    <div className="value">
                                        <div
                                            className="output--label"
                                            onClick={() => setShowOutputDetails(
                                                showOutputDetails === idx ? -1 : idx
                                            )}
                                        >
                                            <div className={classNames(
                                                "margin-r-t", "dropdown--icon",
                                                { opened: showOutputDetails === idx }
                                            )}
                                            >
                                                <DropdownIcon />
                                            </div>
                                            <button type="button" className="margin-r-t color" >
                                                {outputLabel}
                                            </button>
                                        </div>
                                        {showOutputDetails === idx && (
                                            <Output
                                                key={idx}
                                                id={associatedOutput.outputId}
                                                output={output}
                                                amount={Number(output.amount)}
                                                network={network}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="field">
                                    <div className="label">Address found in</div>
                                    <div className="value">{associationLabel}</div>
                                </div>
                                <div className="field">
                                    <div className="label">Date created</div>
                                    <div className="value">{dateCreated}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Pagination
                    currentPage={pageNumber}
                    totalCount={associatedOutputs?.length ?? 0}
                    pageSize={PAGE_SIZE}
                    siblingsCount={1}
                    onPageChange={n => setPageNumber(n)}
                />
            </div> : null
           );
};

export default AssociatedOutputs;

