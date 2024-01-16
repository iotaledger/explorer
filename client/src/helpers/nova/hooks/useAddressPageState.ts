import { Reducer, useEffect, useReducer } from "react";
import { AccountOutput, AddressType } from "@iota/sdk-wasm-nova/web";
import { IBech32AddressDetails } from "~/models/api/IBech32AddressDetails";
import { useAccountDetails } from "./useAccountDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { Bech32AddressHelper } from "~/helpers/nova/bech32AddressHelper";
import { scrollToTop } from "~/helpers/pageUtils";
import { Bech32Helper } from "@iota/iota.js";

export interface IAddressState {
    bech32AddressDetails: IBech32AddressDetails | null;
    accountOutput: AccountOutput | null;
    isAccountDetailsLoading: boolean;
}

const initialState = {
    bech32AddressDetails: null,
    accountOutput: null,
    isAccountDetailsLoading: true,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IBech32AddressDetails;
}

export const useAddressPageState = (): [IAddressState, React.Dispatch<Partial<IAddressState>>] => {
    const location = useLocation();
    const { network, address: addressFromPath } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IAddressState, Partial<IAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    // const addressBech32: string | null = state.bech32AddressDetails?.bech32 ?? null;
    const addressHex: string | null = state.bech32AddressDetails?.hex ?? null;
    const addressType: number | null = state.bech32AddressDetails?.type ?? null;

    const { accountOutput, isLoading: isAccountDetailsLoading } = useAccountDetails(
        network,
        addressType === AddressType.Account ? addressHex : null,
    );

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, addressFromPath) };

        const isBech32 = Bech32Helper.matches(addressFromPath, bech32Hrp);

        if (isBech32) {
            scrollToTop();
            setState({
                ...initialState,
                bech32AddressDetails: addressDetails,
            });
        } else {
            setState(initialState);
        }
    }, [addressFromPath]);

    useEffect(() => {
        setState({
            accountOutput,
            isAccountDetailsLoading,
        });
    }, [accountOutput, isAccountDetailsLoading]);

    return [state, setState];
};
