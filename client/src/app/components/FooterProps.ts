import { IFoundation} from "../../models/webassets/IFoundation";

/**
 * The props for the Footer component.
 */
export interface FooterProps {
    /**
     * The networks to link to.
     */
    networks: {
        /**
         * The label for the network.
         */
        label: string;
        /**
         * The url to navigate to.
         */
        url: string;
    }[];
}
