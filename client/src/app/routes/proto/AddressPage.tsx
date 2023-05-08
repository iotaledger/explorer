import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { calcBalance, useAddress } from "../../../helpers/proto/useAddress";
import "./AddressPage.scss";
import Balances from "../../components/proto/Balances";
import Output from "../../components/proto/Output";
import Spinner from "../../components/Spinner";

interface AddressPageProps {
    network: string;
    address: string;
}

const AddressPage: React.FC<RouteComponentProps<AddressPageProps>> = (
    { match: { params: { network, address } } }
) => {
    const [addr, isAddrLoading] = useAddress(network, address);

    if (isAddrLoading || !addr || !addr.unspentOutputs || !addr.spentOutputs) {
        return (
            <div className="address-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="address--header row space-between">
                            <div className="row middle">
                                <h1>Address {address}</h1>
                                {isAddrLoading && <Spinner />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const balances = calcBalance(addr.unspentOutputs);

    const unspentOutputNodes = addr.unspentOutputs.map(output => (
        output.outputID ?
            <div key={output.outputID.base58} className="transaction-payload">
                <div className="row row--tablet-responsive fill">
                    <div className="card col fill">
                        <div key={output.outputID.base58} className="transaction-from card--content">
                            <Output
                                key={output.outputID.base58} outputId={output.outputID.base58}
                                network={network} isPreExpanded={false}
                            />
                        </div>
                    </div>
                </div>
            </div> : null
    ));

    const spentOutputNodes = addr.spentOutputs.map(output => (
        output.outputID ?
            <div key={output.outputID.base58} className="transaction-payload">
                <div className="row row--tablet-responsive fill">
                    <div className="card col fill">
                        <div className="card--content">
                            <Output
                                key={output.outputID.base58} outputId={output.outputID.base58}
                                network={network} isPreExpanded={false}
                            />
                        </div>
                    </div>
                </div>
            </div> : null
    ));

    return (
        <div className="address-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="address--header row space-between">
                        <div className="row middle">
                            <h1>Address {address}</h1>
                            {isAddrLoading && <Spinner />}
                        </div>
                    </div>
                    <div className="top">
                        <div className="sections">
                            <div className="section">
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Balance</h2>
                                    </div>
                                </div>
                                <div className="asset-items">
                                    <div className="row asset-item--header asset-asset">
                                        <span className="label asset-id">Asset</span>
                                        <span className="label asset-balance">Balance</span>
                                    </div>
                                    <Balances balances={balances} />
                                </div>
                            </div>
                            <div className="section">
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--header">
                                            <div className="row middle">
                                                <h2>Unspent Outputs</h2>
                                            </div>
                                        </div>
                                        <div className="row row--tablet-responsive fill margin-b-s">
                                            <div className="section--data">
                                                <div className="value">
                                                    {unspentOutputNodes.length > 0 ? unspentOutputNodes : "None"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--header">
                                            <div className="row middle">
                                                <h2>Spent Outputs</h2>
                                            </div>
                                        </div>
                                        <div className="row row--tablet-responsive fill margin-b-s">
                                            <div className="section--data">
                                                <div className="value">
                                                    {spentOutputNodes.length > 0 ? spentOutputNodes : "None"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressPage;
