import { Utils } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import AssociatedOutputs from "~/app/components/nova/address/section/association/AssociatedOutputs";
import AddressNotFoundPage from "~/app/components/nova/address/AddressNotFoundPage";
import Spinner from "~/app/components/Spinner";
import Bech32Address from "~/app/components/stardust/address/Bech32Address";
import { useAddressPageState } from "~/helpers/nova/hooks/useAddressPageState";
import { AddressRouteProps } from "../AddressRouteProps";
import "./AddressPage.scss";

const AddressPage: React.FC<RouteComponentProps<AddressRouteProps>> = ({
    match: {
        params: { address },
    },
}) => {
    const isValidBech32Address = Utils.isAddressValid(address);
    const [state] = useAddressPageState();
    const { bech32AddressDetails, isAccountDetailsLoading } = state;

    if (!isValidBech32Address) {
        return <AddressNotFoundPage address={address} />;
    }

    const isPageLoading = isAccountDetailsLoading;

    return (
        <div className="address-page">
            <div className="wrapper">
                {bech32AddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{bech32AddressDetails.typeLabel?.replace("Ed25519", "Address")}</h1>
                            </div>
                            {isPageLoading && <Spinner />}
                        </div>
                        <div className="section no-border-bottom padding-b-0">
                            <div className="section--header">
                                <div className="row middle">
                                    <h2>General</h2>
                                </div>
                            </div>
                            <div className="general-content">
                                <div className="section--data">
                                    <Bech32Address addressDetails={bech32AddressDetails} advancedMode={true} />
                                </div>
                            </div>
                        </div>
                        <div className="section no-border-bottom padding-b-0">
                            <div className="row middle">
                                <h2>Associated Outputs</h2>
                            </div>
                            <AssociatedOutputs addressDetails={bech32AddressDetails} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressPage;
