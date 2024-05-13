import React from "react";
import { Address } from "@iota/sdk-wasm-nova/web";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import TruncatedId from "../../stardust/TruncatedId";
import { NameHelper } from "~/helpers/nova/nameHelper";

interface AddressViewProps {
    address: Address;
}

const AddressView: React.FC<AddressViewProps> = ({ address }) => {
    const { name: networkName, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const addressDetails = AddressHelper.buildAddress(bech32Hrp, address);
    const link = `/${networkName}/addr/${addressDetails.bech32}`;

    return (
        <div className="address-type">
            <div className="card--label">{NameHelper.getAddressTypeName(address.type)}</div>
            <div className="card--value">
                <TruncatedId id={addressDetails.bech32} link={link} linkState={{ addressDetails }} showCopyButton />
            </div>
        </div>
    );
};

export default AddressView;
