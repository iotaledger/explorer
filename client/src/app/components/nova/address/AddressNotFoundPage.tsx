import React from "react";
import addressMainHeaderInfo from "~assets/modals/nova/address/main-header.json";
import Modal from "../../Modal";
import NotFound from "../../NotFound";

interface AddressNotFoundPageProps {
    address: string;
}

const AddressNotFoundPage: React.FC<AddressNotFoundPageProps> = ({ address }) => {
    return (
        <div className="address-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="addr--header">
                        <div className="row middle">
                            <h1>Address</h1>
                            <Modal icon="info" data={addressMainHeaderInfo} />
                        </div>
                    </div>
                    <NotFound searchTarget="address" query={address} />
                </div>
            </div>
        </div>
    );
};

export default AddressNotFoundPage;
