import { Feature } from "@iota/iota.js-stardust";

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
