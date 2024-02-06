import { Address, AddressType, Utils } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import AddressNotFoundPage from "~/app/components/nova/address/AddressNotFoundPage";
import { AddressRouteProps } from "../AddressRouteProps";
import AccountAddressView from "~/app/components/nova/address/AccountAddressView";
import "./AddressPage.scss";

const AddressPage: React.FC<RouteComponentProps<AddressRouteProps>> = ({
    match: {
        params: { address },
    },
}) => {
    const isValidBech32Address = Utils.isAddressValid(address);

    if (!isValidBech32Address) {
        return <AddressNotFoundPage address={address} />;
    }

    const parsedAddress = Utils.parseBech32Address(address);

    const renderAddressView = (parsedAddress: Address) => {
        switch (parsedAddress.type) {
            case AddressType.Account:
                return <AccountAddressView accountAddress={parsedAddress} />;
            default:
                return (
                    <div className="address-page">
                        <div className="wrapper">
                            <div className="inner">
                                <div className="addr--header">
                                    <div className="row middle">
                                        <h1>Unsupported address type</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return renderAddressView(parsedAddress);
};

export default AddressPage;
