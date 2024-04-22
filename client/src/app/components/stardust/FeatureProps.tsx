import { Feature } from "@iota/sdk-wasm-stardust/web";

export interface FeatureProps {
    /**
     * The feature.
     */
    feature: Feature;

    /**
     * Is the feature pre-expanded.
     */
    isPreExpanded?: boolean;

    /**
     * Is the feature immutable.
     */
    isImmutable: boolean;

    /**
     * Is the metadata feature for participation event.
     */
    isParticipationEventMetadata?: boolean;
}
