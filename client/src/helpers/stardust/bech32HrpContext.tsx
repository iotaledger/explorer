/* eslint-disable @typescript-eslint/naming-convention */
import { createContext } from "react";

interface IBech32HrpContext {
    bech32Hrp: string;
}

const defaultState = {
  bech32Hrp: "iota"
};

const Bech32HrpContext = createContext<IBech32HrpContext>(defaultState);

export default Bech32HrpContext;
