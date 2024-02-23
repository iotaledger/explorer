import React, { useState } from 'react';
import { features } from './VisualizerInstance';
import {
    MIN_SINUSOID_PERIOD,
    MAX_SINUSOID_PERIOD,
    MIN_SINUSOID_AMPLITUDE,
    MAX_SINUSOID_AMPLITUDE,
    MIN_TILT_FACTOR_DEGREES,
    MAX_TILT_FACTOR_DEGREES,
} from "./constants";
import "./Controls.scss";

const defaultControlsVisualiser: IControlsVisualiser = {
    MIN_SINUSOID_PERIOD: MIN_SINUSOID_PERIOD,
    MAX_SINUSOID_PERIOD: MAX_SINUSOID_PERIOD,
    MIN_SINUSOID_AMPLITUDE: MIN_SINUSOID_AMPLITUDE,
    MAX_SINUSOID_AMPLITUDE: MAX_SINUSOID_AMPLITUDE,
    MIN_TILT_FACTOR_DEGREES: MIN_TILT_FACTOR_DEGREES,
    MAX_TILT_FACTOR_DEGREES: MAX_TILT_FACTOR_DEGREES,
}

interface IControlsVisualiser {
    MIN_SINUSOID_PERIOD: number;
    MAX_SINUSOID_PERIOD: number;
    MIN_SINUSOID_AMPLITUDE: number;
    MAX_SINUSOID_AMPLITUDE: number;
    MIN_TILT_FACTOR_DEGREES: number;
    MAX_TILT_FACTOR_DEGREES: number;
}
/**
 * Retrieves a value from localStorage and parses it as JSON.
 */
const LOCAL_STORAGE_KEY = 'controlsVisualiser';

export function getFromLocalStorage(): IControlsVisualiser {
    if (features.controlsVisualiserEnabled) {
        const item = localStorage.getItem(LOCAL_STORAGE_KEY);
        return item ? JSON.parse(item) : defaultControlsVisualiser;
    } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return defaultControlsVisualiser;
    }


}

/**
 * Saves a value to localStorage as a JSON string.
 */
function setToLocalStorage(value: IControlsVisualiser) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
}

const Input = ({label, min, max, val, set}: {label: string; min: number; max: number; val: number; set: (val: number) => void}) => {
    const [err, setErr] = useState<string | undefined>();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        // Check if the input value is a valid number
        if (event.target.value === '-' || event.target.value === '') {
            // @ts-ignore
            set(event.target.value);
            return;
        }

        const newValue = Math.max(min, Math.min(max, Number(event.target.value)));
        if (newValue >= min && newValue <= max) {
            setErr(undefined);
            set(newValue);
        } else {
            set(newValue);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <label>{label}</label>
            <input
                type="number"
                // min={min}
                // max={max}
                value={val}
                onChange={handleChange}
            />
            {!!err && <div>{err}</div>}
        </div>
    );
};

export const Controls = () => {
    const [state, setState] = useState<IControlsVisualiser>(() => {
        // Use getFromLocalStorage to retrieve the state
        return getFromLocalStorage() || defaultControlsVisualiser;
    });

    const [errors, setErrors] = useState({});

    const handleApply = () => {
        if (Object.keys(errors).some(key => errors[key])) {
            // Handle the error case, e.g., display a message
            console.error("There are errors in the form.");
            return;
        }

        setToLocalStorage(state);
        location.reload();
    }

    const setError = (key: string, error: string) => {
        setErrors(prevErrors => ({
            ...prevErrors,
            [key]: error
        }));
    };

    if (!features.controlsVisualiserEnabled) {
        return null;
    }

    return (
        <div className={"controls-container"}>
            <div className="controls__list">
                <div className="controls__item">
                    <Input
                        label={"Min sinusoid period"}
                        min={1}
                        max={7}
                        val={state.MIN_SINUSOID_PERIOD}
                        set={(val) => {
                            setState({
                                ...state,
                                MIN_SINUSOID_PERIOD: val,
                            });
                        }}
                        setError={(error) => setError('MIN_SINUSOID_PERIOD', error)}
                    />
                </div>
                <div className="controls__item">
                    <Input
                        label={"Max sinusoid period"}
                        min={8}
                        max={15}
                        val={state.MAX_SINUSOID_PERIOD}
                        set={(val) => {
                            setState({
                                ...state,
                                MAX_SINUSOID_PERIOD: val,
                            });
                        }}
                        error={errors['MAX_SINUSOID_PERIOD']}
                        setError={(error) => setError('MAX_SINUSOID_PERIOD', error)}
                    />
                </div>
                <div className="controls__item">
                    <Input
                        label={"Min sinusoid amplitude"}
                        min={100}
                        max={200}
                        val={state.MIN_SINUSOID_AMPLITUDE}
                        set={(val) => {
                            setState({
                                ...state,
                                MIN_SINUSOID_AMPLITUDE: val,
                            });
                        }}
                    />
                </div>
                <div className="controls__item">
                    <Input
                        label={"Max sinusoid amplitude"}
                        min={200}
                        max={500}
                        val={state.MAX_SINUSOID_AMPLITUDE}
                        set={(val) => {
                            setState({
                                ...state,
                                MAX_SINUSOID_AMPLITUDE: val,
                            });
                        }}
                    />
                </div>
                <div className="controls__item">
                    <Input
                        label={"Min tilt factor degrees"}
                        min={1}
                        max={15}
                        val={state.MIN_TILT_FACTOR_DEGREES}
                        set={(val) => {
                            setState({
                                ...state,
                                MIN_TILT_FACTOR_DEGREES: val,
                            });
                        }}
                    />
                </div>
                <div className="controls__item">
                    <Input
                        label={"Max tilt factor degrees"}
                        min={16}
                        max={100}
                        val={state.MAX_TILT_FACTOR_DEGREES}
                        set={(val) => {
                            setState({
                                ...state,
                                MAX_TILT_FACTOR_DEGREES: val,
                            });
                        }}
                    />
                </div>
            </div>

            <button type={"button"} onClick={handleApply}>
                Apply
            </button>
        </div>
    );
};


