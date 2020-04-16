import { RouteComponentProps } from "react-router-dom";
import { IConfiguration } from "../models/config/IConfiguration";

export interface AppProps extends RouteComponentProps {
    /**
     * The configuration.
     */
    configuration: IConfiguration;
}
