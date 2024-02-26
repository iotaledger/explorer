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
import "./Controls.scss";
import { useTangleStore } from "~features/visualizer-threejs/store";

enum VisualizerInput {
    MinSinusoidPeriod = 'minSinusoidPeriod',
    MaxSinusoidPeriod = 'maxSinusoidPeriod',
    MinSinusiudAmplitude = 'minSinusiudAmplitude',
    MaxSinusoidAmplitude = 'maxSinusoidAmplitude',
    MinTiltDegrees = 'minTiltDegrees',
    MaxTiltDegrees = 'maxTiltDegrees',
    TiltDurationSeconds = 'tiltDurationSeconds'
}

const defaultControlsVisualiser: IControlsVisualiser = {
    MIN_SINUSOID_PERIOD: MIN_SINUSOID_PERIOD,
    MAX_SINUSOID_PERIOD: MAX_SINUSOID_PERIOD,
    MIN_SINUSOID_AMPLITUDE: MIN_SINUSOID_AMPLITUDE,
    MAX_SINUSOID_AMPLITUDE: MAX_SINUSOID_AMPLITUDE,
    MIN_TILT_FACTOR_DEGREES: MIN_TILT_FACTOR_DEGREES,
    MAX_TILT_FACTOR_DEGREES: MAX_TILT_FACTOR_DEGREES,
    TILT_DURATION_SECONDS: TILT_DURATION_SECONDS,
};

type TKey = keyof IControlsVisualiser;

/**
 * Retrieves a value from localStorage and parses it as JSON.
 */
const LOCAL_STORAGE_KEY = "controlsVisualiser";

export const getFromLocalStorage = (): IControlsVisualiser => {
    if (features.controlsVisualiserEnabled) {
        const item = localStorage.getItem(LOCAL_STORAGE_KEY);
        return item ? JSON.parse(item) : defaultControlsVisualiser;
    } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return defaultControlsVisualiser;
    }
};

/**
 * Saves a value to localStorage as a JSON string.
 */
function setToLocalStorage(value: IControlsVisualiser) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
}

/**
 */
function isExistsInLocalStorage(): boolean {
    return !!localStorage.getItem(LOCAL_STORAGE_KEY);
}

export const ConfigControls = () => {
    const forcedZoom = useTangleStore((state) => state.forcedZoom);
    const setForcedZoom = useTangleStore((state) => state.setForcedZoom);
    const [localZoom, setLocalZoom] = useState<number | undefined>(forcedZoom);

    const [state, setState] = useState<IControlsVisualiser>(() => {
        // Use getFromLocalStorage to retrieve the state
        return getFromLocalStorage() || defaultControlsVisualiser;
    });
    const [isShowReset, setIsShowReset] = useState(() => {
        return isExistsInLocalStorage();
    });

    const [errors, setErrors] = useState<{
        [k: string]: string;
    }>({});

    const inputs: {
        key: TKey;
        label: string;
        min: number;
        max: number;
    }[] = [
        {
            key: "MIN_SINUSOID_PERIOD",
            label: "Min sinusoid period",
            min: 1,
            max: 7,
        },
        {
            key: "MAX_SINUSOID_PERIOD",
            label: "Max sinusoid period",
            min: 8,
            max: 15,
        },
        {
            key: "MIN_SINUSOID_AMPLITUDE",
            label: "Min sinusoid amplitude",
            min: 100,
            max: 199,
        },
        {
            key: "MAX_SINUSOID_AMPLITUDE",
            label: "Max sinusoid amplitude",
            min: 200,
            max: 500,
        },
        {
            key: "MIN_TILT_FACTOR_DEGREES",
            label: "Min tilt factor degrees",
            min: 1,
            max: 15,
        },
        {
            key: "MAX_TILT_FACTOR_DEGREES",
            label: "Max tilt factor degrees",
            min: 16,
            max: 100,
        },
        {
            key: "TILT_DURATION_SECONDS",
            label: "Tilt_duration_seconds",
            min: 1,
            max: 10,
        },
    ];

    const handleApply = () => {
        if (Object.keys(errors).some((key) => errors[key])) {
            // Handle the error case, e.g., display a message
            console.error("There are errors in the form.");
            return;
        }

        setToLocalStorage(state);
        location.reload();
    };

    const handleChange = (key: TKey, val: string) => {
        const input = inputs.find((input) => input.key === key);
        if (!input) return;

        if (!val) {
            setErrors((prevErrors) => ({ ...prevErrors, [key]: "Value is required" }));
            setState((prevState) => ({ ...prevState, [key]: "" }));
            return;
        }

        const numericValue = Number(val);
        if (numericValue < input.min || numericValue > input.max) {
            setErrors((prevErrors) => ({ ...prevErrors, [key]: `Value must be between ${input.min} and ${input.max}` }));
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
        }

        setState((prevState) => ({ ...prevState, [key]: numericValue }));
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
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <label>{i.label}</label>
                                <input type="number" value={state[i.key]} onChange={(e) => handleChange(i.key, e.target.value)} />
                                {!!errors[i.key] && <div>{errors[i.key]}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="controls__actions">
                <button type={"button"} onClick={handleApply}>
                    Apply
                </button>
                {isShowReset && (
                    <button
                        type={"button"}
                        onClick={() => {
                            localStorage.removeItem(LOCAL_STORAGE_KEY);
                            setIsShowReset(false);
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
                    type="number"
                    value={localZoom || `${localZoom}`}
                    onChange={(e) => {
                        if (!e.target.value) {
                            setLocalZoom(undefined);
                            return;
                        }

                        const value = Number(e.target.value);

                        if (value > 2) {
                            setLocalZoom(2);
                            return;
                        }
                        setLocalZoom(Number(e.target.value));
                    }}
                />
                <div className="controls__actions">
                    <button type={"button"} onClick={() => setForcedZoom(localZoom)}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ConfigControls);
