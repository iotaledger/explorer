import { FeatureBlockTypes } from "@iota/iota.js-stardust";
import * as H from "history";

export interface FeatureBlockProps {
    /**
     * The feature block.
     */
    featureBlock: FeatureBlockTypes;

    /**
     * Network
     */
    network: string;

    /**
     * History for navigation.
     */
    history: H.History;
}
