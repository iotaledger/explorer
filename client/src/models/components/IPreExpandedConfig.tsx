export interface IPreExpandedConfig {
    isPreExpanded?: boolean;
    unlockConditions?: boolean[];
    features?: boolean[];
    immutableFeatures?: boolean[];
    nativeTokens?: boolean[];

    // generic to expand all
    isAllPreExpanded?: boolean;
}
