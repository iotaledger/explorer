import { AccountAddress, Address, AddressType, Ed25519Address, NftAddress, Utils } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import AddressNotFoundPage from "~/app/components/nova/address/AddressNotFoundPage";
import { AddressRouteProps } from "../AddressRouteProps";
import AccountAddressView from "~/app/components/nova/address/AccountAddressView";
import Ed25519AddressView from "~/app/components/nova/address/Ed25519AddressView";
import "./AddressPage.scss";
import NftAddressView from "~/app/components/nova/address/NftAddressView";

const AddressPage: React.FC<RouteComponentProps<AddressRouteProps>> = ({
    match: {
        params: { address: addressString },
    },
}) => {
    const isValidBech32Address = Utils.isAddressValid(addressString);

    if (!isValidBech32Address) {
        return <AddressNotFoundPage address={addressString} />;
    }

    const parsedAddress = Utils.parseBech32Address(addressString);

    const renderAddressView = (parsedAddress: Address) => {
        switch (parsedAddress.type) {
            case AddressType.Ed25519:
                return <Ed25519AddressView ed25519Address={parsedAddress as Ed25519Address} />;
            case AddressType.Account:
                return <AccountAddressView accountAddress={parsedAddress as AccountAddress} />;
            case AddressType.Nft:
                return <NftAddressView nftAddress={parsedAddress as NftAddress} />;
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
