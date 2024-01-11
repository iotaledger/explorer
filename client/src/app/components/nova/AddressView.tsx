import React from "react";
import { Address, AddressType } from "@iota/sdk-wasm-nova/web";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { Bech32AddressHelper } from "~/helpers/nova/bech32AddressHelper";
import TruncatedId from "../stardust/TruncatedId";

interface AddressViewProps {
    address: Address;
}

const AddressView: React.FC<AddressViewProps> = ({ address }) => {
    const { name: networkName, bech32Hrp } = useNetworkInfoNova(
        (s) => s.networkInfo,
    );
    const addressDetails = Bech32AddressHelper.buildAddress(bech32Hrp, address);
    const link = `/${networkName}/addr/${addressDetails.bech32}`;

    return (
        <div className="address-type">
            <div className="card--label">
                {getAddressTypeName(address.type)}
            </div>
            <div className="card--value">
                <TruncatedId
                    id={addressDetails.bech32}
                    link={link}
                    showCopyButton
                />
            </div>
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
