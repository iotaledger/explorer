/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Magnitudes, UnitsHelper } from "@iota/iota.js-stardust";
import React, { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { INetwork } from "../../../../models/config/INetwork";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { getFilterFieldDefaults } from "../../../../models/services/filterField";
import { IFilterSettings } from "../../../../models/services/stardust/IFilterSettings";
import { SettingsService } from "../../../../services/settingsService";
import NetworkContext from "../../../context/NetworkContext";
import { getFilterAppliers } from "./LandingUtils";
import "./FeedFilters.scss";

interface FeedFiltersProps {
    networkConfig: INetwork;
    settingsService: SettingsService;
    items: IFeedItem[];
    setFilteredItems: (filteredItems: IFeedItem[]) => void;
}

const DEFAULT_MAX_VALUE = "10000";

const FeedFilters: React.FC<FeedFiltersProps> = (
    { networkConfig, settingsService, items, setFilteredItems }
) => {
    const mounted = useRef(false);
    const { tokenInfo: { unit, subunit, decimals } } = useContext(NetworkContext);
    const unitMagnitude = UnitsHelper.calculateBest(Math.pow(10, decimals)) ?? "";

    const [isModalOpen, setModalOpen] = useState(false);
    const [isFeedPaused, setIsFeedPaused] = useState(false);
    const [minValue, setMinValue] = useState("0");
    const [maxValue, setMaxValue] = useState(DEFAULT_MAX_VALUE);
    const [minMagnitude, setMinMagnitude] = useState("");
    const [maxMagnitude, setMaxMagnitude] = useState(unitMagnitude);
    const [filterFields, setFilterFields] = useState(
        getFilterFieldDefaults(networkConfig.protocolVersion ?? STARDUST)
    );
    const [frozenItems, setFrozenItems] = useState<IFeedItem[]>([]);

    useEffect(() => {
        mounted.current = true;
        let filterSettings: IFilterSettings | undefined;
        const settings = settingsService.get();
        if (settings.filters) {
            filterSettings = settings.filters[networkConfig.network];
        }
        filterSettings?.valueMinimum && setMinValue(filterSettings.valueMinimum);
        filterSettings?.valueMaximum && setMaxValue(filterSettings.valueMaximum);
        filterSettings?.valueMinimumMagnitude && setMinMagnitude(filterSettings.valueMinimumMagnitude);
        filterSettings?.valueMaximumMagnitude && setMaxMagnitude(filterSettings.valueMaximumMagnitude);
        filterSettings?.valuesFilter && setFilterFields(filterSettings.valuesFilter);

        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        const updateFilters = async (): Promise<void> => {
            const settings = settingsService.get();
            if (mounted.current && networkConfig) {
                settings.filters = settings.filters ?? {};
                settings.filters[networkConfig.network] = {
                    valuesFilter: filterFields,
                    valueMinimum: minValue,
                    valueMinimumMagnitude: minMagnitude as Magnitudes,
                    valueMaximum: maxValue,
                    valueMaximumMagnitude: maxMagnitude
                };

                settingsService.save();
                applyFilters();
            }
        };
        // eslint-disable-next-line no-void
        void updateFilters();
    }, [items, filterFields, minValue, maxValue, minMagnitude, maxMagnitude]);

    const transactionDropdown = (type: "minimum" | "maximum"): ReactNode => (
        <div className="col">
            <span className="label margin-b-2">
                {type === "minimum" ? "Min value" : "Max value"}
            </span>
            <span className="filter--value">
                <input
                    type="text"
                    className="input-plus"
                    value={type === "minimum" ? minValue : maxValue}
                    onChange={e => (type === "minimum" ?
                                    updateMinimum(e.target.value) :
                                    updateMaximum(e.target.value)
                                   )}
                />
                <div className="select-wrapper">
                    <select
                        className="select-plus"
                        value={type === "minimum" ? minMagnitude : maxMagnitude}
                        onChange={e => (
                            type === "minimum" ?
                                setMinMagnitude(e.target.value as Magnitudes) :
                                setMaxMagnitude(e.target.value as Magnitudes)
                        )}
                    >
                        {subunit && (<option value="">{subunit}</option>)}
                        <option value={unitMagnitude}>{unit}</option>
                    </select>
                    <span className="material-icons">arrow_drop_down</span>
                </div>
            </span>
        </div>
    );

    const toggleFilter = (payloadType: string): void => {
        const toggledFields = filterFields.map(field => {
            if (field.label === payloadType) {
                field.isEnabled = !field.isEnabled;
            }
            return field;
        });
        setFilterFields(toggledFields);
    };

    const updateMinimum = (min: string): void => {
        const val = Number.parseFloat(min);
        if (!Number.isNaN(val)) {
            setMinValue(val.toString());
        } else {
            setMinValue("");
        }
    };

    const updateMaximum = (max: string): void => {
        const val = Number.parseFloat(max);
        if (!Number.isNaN(val)) {
            setMaxValue(val.toString());
        } else {
            setMaxValue("");
        }
    };


    const applyFilters = (): void => {
        if (mounted.current) {
            const minLimit = UnitsHelper.convertUnits(Number.parseFloat(minValue), minMagnitude as Magnitudes, "");
            const maxLimit = UnitsHelper.convertUnits(Number.parseFloat(maxValue), maxMagnitude, "");
            const filterAppliers = getFilterAppliers(minLimit, maxLimit).filter(applier => (
                filterFields.some(field => applier.payloadType === field.label && field.isEnabled))
            );
            const itemsToFilter = isFeedPaused ? frozenItems : items;

            const filteredItems = itemsToFilter.filter(
                item => filterAppliers.some(applier => applier.apply(item))
            ).slice(0, 10);

            setFrozenItems(filteredItems);
            setFilteredItems(filteredItems);
        }
    };

    const resetFilters = (): void => {
        setMinValue("0");
        setMaxValue(DEFAULT_MAX_VALUE);
        setMinMagnitude("");
        setMaxMagnitude(unitMagnitude);
        setFilterFields(filterFields.map(field => ({ ...field, isEnabled: true })));
    };

    return (
        <div className="feed--filters">
            <button
                className="button--unstyled"
                type="button"
                onClick={() => setIsFeedPaused(!isFeedPaused)}
            >
                {isFeedPaused
                    ? <span className="material-icons">play_arrow</span>
                    : <span className="material-icons">pause</span>}
            </button>
            <div className="filters-button-wrapper">
                <button
                    type="button"
                    className="button--unstyled toggle-filters-button"
                    onClick={() => setModalOpen(!isModalOpen)}
                >
                    <span className="material-icons">tune</span>
                </button>
                <div className="filters-button-wrapper__counter">
                    {filterFields.filter(field => field.isEnabled).length}
                </div>
            </div>
            {isModalOpen && (
                <div className="filter-wrapper">
                    <div className="filter">
                        <div className="filter-header row space-between middle">
                            <button className="button--unstyled" type="button" onClick={() => resetFilters()}>
                                Reset
                            </button>
                            <span>Payload Filter</span>
                            <button className="done-button" type="button" onClick={() => setModalOpen(false)}>
                                Done
                            </button>
                        </div>

                        <div className="filter-content">
                            {filterFields.map(field => (
                                <React.Fragment key={field.label}>
                                    <label >
                                        <input
                                            type="checkbox"
                                            checked={field.isEnabled}
                                            onChange={() => toggleFilter(field.label)}
                                        />
                                        {field.label}
                                    </label>
                                    {field.label === "Transaction" && field.isEnabled && (
                                        <div className="row">
                                            {transactionDropdown("minimum")}
                                            {transactionDropdown("maximum")}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <div
                        className="filter--bg"
                        onClick={() => setModalOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default FeedFilters;

