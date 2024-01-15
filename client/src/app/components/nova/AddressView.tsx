import React from "react";
import { Address, AddressType } from "@iota/sdk-wasm-nova/web";

interface AddressViewProps {
    address: Address;
}

const AddressView: React.FC<AddressViewProps> = ({ address }) => {
    return (
        <div className="address-type">
            <div className="card--label">{getAddressTypeName(address.type)}</div>
            <div className="card--value">{JSON.stringify(address)}</div>
        </div>
    );
};

function getAddressTypeName(type: AddressType): string {
    switch (type) {
        case AddressType.Ed25519:
            return "Ed25519";
        case AddressType.Account:
            return "Account";
        case AddressType.Nft:
            return "Nft";
        case AddressType.Anchor:
            return "Anchor";
        case AddressType.ImplicitAccountCreation:
            return "ImplicitAccountCreation";
        case AddressType.Multi:
            return "Multi";
        case AddressType.Restricted:
            return "Restricted";
    }
}

export default AddressView;
