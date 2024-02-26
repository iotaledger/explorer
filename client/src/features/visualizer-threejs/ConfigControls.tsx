import React, { useState } from "react";
import {
    MIN_SINUSOID_PERIOD,
    MAX_SINUSOID_PERIOD,
    MIN_SINUSOID_AMPLITUDE,
    MAX_SINUSOID_AMPLITUDE,
    MIN_TILT_FACTOR_DEGREES,
    MAX_TILT_FACTOR_DEGREES,
    TILT_DURATION_SECONDS,
    features,
} from "./constants";
import { useTangleStore } from "~features/visualizer-threejs/store";
import "./ConfigControls.scss";

enum VisualizerConfig {
    MinSinusoidPeriod = "minSinusoidPeriod",
    MaxSinusoidPeriod = "maxSinusoidPeriod",
    MinSinusoidAmplitude = "minSinusoidAmplitude",
    MaxSinusoidAmplitude = "maxSinusoidAmplitude",
    MinTiltDegrees = "minTiltDegrees",
    MaxTiltDegrees = "maxTiltDegrees",
    TiltDurationSeconds = "tiltDurationSeconds",
}

const VISUALIZER_CONFIG_LOCAL_STORAGE_KEY = "visualizerConfigs";

const DEFAULT_VISUALIZER_CONFIG_VALUES: Record<VisualizerConfig, number> = {
    [VisualizerConfig.MinSinusoidPeriod]: MIN_SINUSOID_PERIOD,
    [VisualizerConfig.MaxSinusoidPeriod]: MAX_SINUSOID_PERIOD,
    [VisualizerConfig.MinSinusoidAmplitude]: MIN_SINUSOID_AMPLITUDE,
    [VisualizerConfig.MaxSinusoidAmplitude]: MAX_SINUSOID_AMPLITUDE,
    [VisualizerConfig.MinTiltDegrees]: MIN_TILT_FACTOR_DEGREES,
    [VisualizerConfig.MaxTiltDegrees]: MAX_TILT_FACTOR_DEGREES,
    [VisualizerConfig.TiltDurationSeconds]: TILT_DURATION_SECONDS,
};

/**
 * Retrieves a value from localStorage and parses it as JSON.
 */
export const getVisualizerConfigValues = (): Record<VisualizerConfig, number> => {
    if (features.controlsVisualiserEnabled) {
        const item = localStorage.getItem(VISUALIZER_CONFIG_LOCAL_STORAGE_KEY);
        return item ? JSON.parse(item) : DEFAULT_VISUALIZER_CONFIG_VALUES;
    } else {
        localStorage.removeItem(VISUALIZER_CONFIG_LOCAL_STORAGE_KEY);
        return DEFAULT_VISUALIZER_CONFIG_VALUES;
    }
};

/**
 * Saves a value to localStorage as a JSON string.
 */
function setToLocalStorage(value: Record<VisualizerConfig, number>) {
    localStorage.setItem(VISUALIZER_CONFIG_LOCAL_STORAGE_KEY, JSON.stringify(value));
}

/**
 * Checks if config for visualizer inputs exists in localStorage.
 */
function controlsExistInLocalStorage(): boolean {
    return !!localStorage.getItem(VISUALIZER_CONFIG_LOCAL_STORAGE_KEY);
}

export const ConfigControls = () => {
    const forcedZoom = useTangleStore((state) => state.forcedZoom);
    const setForcedZoom = useTangleStore((state) => state.setForcedZoom);
    const [localZoom, setLocalZoom] = useState<number | undefined>(forcedZoom);

    const [visualizerConfigValues, setVisualizerConfigValues] = useState<Record<VisualizerConfig, number>>(() => {
        return getVisualizerConfigValues() || DEFAULT_VISUALIZER_CONFIG_VALUES; // Use getFromLocalStorage to retrieve the state
    });
    const [showResetButton, setShowResetButton] = useState(() => {
        return controlsExistInLocalStorage();
    });

    const [errors, setErrors] = useState<{
        [k: string]: string;
    }>({});

    const inputs: {
        key: VisualizerConfig;
        label: string;
        min: number;
        max: number;
    }[] = [
        {
            key: VisualizerConfig.MinSinusoidPeriod,
            label: "Min sinusoid period",
            min: 1,
            max: 7,
        },
        {
            key: VisualizerConfig.MaxSinusoidPeriod,
            label: "Max sinusoid period",
            min: 8,
            max: 15,
        },
        {
            key: VisualizerConfig.MinSinusoidAmplitude,
            label: "Min sinusoid amplitude",
            min: 50,
            max: 199,
        },
        {
            key: VisualizerConfig.MaxSinusoidAmplitude,
            label: "Max sinusoid amplitude",
            min: 200,
            max: 500,
        },
        {
            key: VisualizerConfig.MinTiltDegrees,
            label: "Min tilt factor degrees",
            min: 0,
            max: 90,
        },
        {
            key: VisualizerConfig.MaxTiltDegrees,
            label: "Max tilt factor degrees",
            min: 0,
            max: 90,
        },
        {
            key: VisualizerConfig.TiltDurationSeconds,
            label: "Tilt duration (seconds)",
            min: 1,
            max: 100,
        },
    ];

    const handleApply = () => {
        if (Object.keys(errors).some((key) => errors[key])) {
            // Handle the error case, e.g., display a message
            console.error("There are errors in the form.");
            return;
        }

        setToLocalStorage(visualizerConfigValues);
        location.reload();
    };

    const handleChange = (key: VisualizerConfig, val: string) => {
        const input = inputs.find((input) => input.key === key);
        if (!input) return;

        if (!val) {
            setErrors((prevErrors) => ({ ...prevErrors, [key]: "Value is required" }));
            setVisualizerConfigValues((prevState) => ({ ...prevState, [key]: "" }));
            return;
        }

        const numericValue = Number(val);
        if (numericValue < input.min || numericValue > input.max) {
            setErrors((prevErrors) => ({ ...prevErrors, [key]: `Value must be between ${input.min} and ${input.max}` }));
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
        }

        setVisualizerConfigValues((prevState) => ({ ...prevState, [key]: numericValue }));
    };

    if (!features.controlsVisualiserEnabled) {
        return null;
    }

    return (
        <div className={"controls-container"}>
            <div className="controls__list">
                {inputs.map((i) => {
                    return (
                        <div key={i.key} className="controls__item">
                            <label>{i.label}</label>
                            <input
                                type="number"
                                value={visualizerConfigValues[i.key]}
                                onChange={(e) => handleChange(i.key, e.target.value)}
                            />
                            {!!errors[i.key] && <div className={"controls__error"}>{errors[i.key]}</div>}
                        </div>
                    );
                })}
            </div>

            <div className="controls__actions">
                <button type={"button"} onClick={handleApply}>
                    Apply
                </button>
                {showResetButton && (
                    <button
                        onClick={() => {
                            localStorage.removeItem(VISUALIZER_CONFIG_LOCAL_STORAGE_KEY);
                            setShowResetButton(false);
                            location.reload();
                        }}
                    >
                        Reset
                    </button>
                )}
            </div>

            <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block" }}>Zoom</label>
                <input
                    value={localZoom === undefined ? "" : localZoom}
                    onChange={(e) => {
                        const input = e.target.value;

                        if (!input) {
                            setLocalZoom(undefined);
                            return;
                        }

                        const numberRegExp = /^-?\d+(\.|\.\d*|\d*)?$/;
                        if (numberRegExp.test(input)) {
                            if (input.endsWith(".")) {
                                setLocalZoom(input as any);
                            } else {
                                const value = parseFloat(input);
                                if (value > 2) {
                                    setLocalZoom(2);
                                    return;
                                }
                                setLocalZoom(value);
                            }
                        }
                    }}
                />
                <div className="controls__actions">
                    <button
                        type={"button"}
                        onClick={() => {
                            if (localZoom === undefined || `${localZoom}`.endsWith(".")) {
                                return;
                            }
                            setForcedZoom(localZoom);
                        }}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ConfigControls);
