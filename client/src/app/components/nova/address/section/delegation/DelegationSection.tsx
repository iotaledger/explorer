import { DelegationOutput, Utils } from "@iota/sdk-wasm-nova/web";
import React, { useEffect, useState } from "react";
import Pagination from "~/app/components/Pagination";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { IRewardsResponse } from "~/models/api/nova/IRewardsResponse";
import "./DelegationSection.scss";

interface DelegationSectionProps {
    readonly delegationDetails: IRewardsResponse[] | null;
}

const PAGE_SIZE: number = 10;

const DelegationSection: React.FC<DelegationSectionProps> = ({ delegationDetails }) => {
    const { name: network, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [pageNumber, setPageNumber] = useState(1);
    const [currentPage, setCurrentPage] = useState<IRewardsResponse[]>([]);

    const totalAmount = delegationDetails?.reduce((acc, delegation) => acc + BigInt(delegation.output?.output?.amount ?? 0), BigInt(0));
    const totalRewards = delegationDetails?.reduce((acc, delegation) => acc + BigInt(delegation.manaRewards?.rewards ?? 0), BigInt(0));

    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (delegationDetails) {
            setCurrentPage(delegationDetails.slice(from, to));
        }
    }, [delegationDetails, pageNumber]);

    if (delegationDetails === null) {
        return null;
    }

    return (
        <div className="section transaction--section">
            <div className="card card--no-border">
                <div className="field">
                    <div className="card--label margin-b-t">Total amount</div>
                    <div className="card--value">{totalAmount?.toString()}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Total rewards</div>
                    <div className="card--value">{totalRewards?.toString()}</div>
                </div>
            </div>

            <table className="table--delegation">
                <thead>
                    <tr>
                        <th>Output Id</th>
                        <th>Validator address</th>
                        <th>Amount</th>
                        <th>Rewards</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPage.map((delegation, k) => {
                        const validatorAddress = Utils.addressToBech32(
                            (delegation.output?.output as DelegationOutput).validatorAddress,
                            bech32Hrp,
                        );

                        return (
                            <tr key={`delegation-row-${k}`}>
                                <td className="highlight">
                                    <TruncatedId id={delegation.outputId} link={`/${network}/output/${delegation.outputId}`} />
                                </td>
                                <td className="highlight">
                                    <TruncatedId id={validatorAddress} link={`/${network}/addr/${validatorAddress}`} />
                                </td>
                                <td>{delegation.output?.output.amount.toString() ?? "-"}</td>
                                <td>{delegation.manaRewards?.rewards.toString() ?? "-"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Only visible in mobile*/}
            <div className="cards--delegation">
                {currentPage.map((delegation, k) => {
                    const validatorAddress = Utils.addressToBech32(
                        (delegation.output?.output as DelegationOutput).validatorAddress,
                        bech32Hrp,
                    );

                    return (
                        <div className="card" key={`delegation-row-${k}`}>
                            <div className="field">
                                <div className="label">Output Id</div>
                                <div className="value">
                                    <TruncatedId id={delegation.outputId} link={`/${network}/output/${delegation.outputId}`} />
                                </div>
                            </div>
                            <div className="field">
                                <div className="label">Validator Address</div>
                                <div className="value">
                                    <TruncatedId id={validatorAddress} link={`/${network}/addr/${validatorAddress}`} />
                                </div>
                            </div>
                            <div className="field">
                                <div className="label">Amount</div>
                                <div className="value">{delegation.output?.output.amount.toString() ?? "-"}</div>
                            </div>
                            <div className="field">
                                <div className="label">Rewards</div>
                                <div className="value">{delegation.manaRewards?.rewards.toString() ?? "-"}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Pagination
                currentPage={pageNumber}
                totalCount={delegationDetails?.length ?? 0}
                pageSize={PAGE_SIZE}
                siblingsCount={1}
                onPageChange={(number) => setPageNumber(number)}
            />
        </div>
    );
};

export default DelegationSection;
